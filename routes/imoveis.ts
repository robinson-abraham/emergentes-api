import { TipoImovel, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import { verificaToken } from '../middlewares/verificaToken'

const prisma = new PrismaClient()
const router = Router()

const imovelSchema = z.object({
  titulo: z.string().min(10),
  quartos: z.number().int().min(1),
  capacidade: z.number().int().min(1),
  valor_diaria: z.number().min(0),
  foto: z.string().url(),
  comodidades: z.string().nullable().optional(),
  tipo: z.nativeEnum(TipoImovel).optional(),
  destaque: z.boolean().optional(),
  categoriaId: z.number().int(),
  adminId: z.string().uuid()
})

router.get("/", async (req, res) => {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: { ativo: true },
      include: { categoria: true },
      orderBy: { id: 'desc' }
    })
    res.status(200).json(imoveis)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/admin", async (req, res) => {
  try {
    const imoveis = await prisma.imovel.findMany({
      include: { categoria: true },
      orderBy: { id: 'desc' }
    })
    res.status(200).json(imoveis)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id: Number(id) },
      include: { categoria: true }
    })
    res.status(200).json(imovel)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", verificaToken, async (req, res) => {
  const adminId = req.adminLogadoId as string;
  const result = imovelSchema.safeParse({...req.body, adminId});
  if (!result.success) {
    return res.status(400).json({ erro: result.error.issues });
  }

  const { titulo, quartos, capacidade, valor_diaria, foto, comodidades = null,
    destaque = true, tipo = 'CASA', categoriaId } = result.data;

  try {
    const imovel = await prisma.imovel.create({
      data: {
        titulo, quartos, capacidade, valor_diaria, foto, comodidades, destaque,
        tipo, categoriaId, adminId
      }
    });
    res.status(201).json(imovel);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const adminId = req.adminLogadoId as string;
  const adminNome = req.adminLogadoNome as string;

  try {
    const imovel = await prisma.imovel.update({
      where: { id: Number(id) },
      data: { ativo: false }
    });

    await prisma.log.create({
      data: {
        descricao: `Exclusão Lógica do Imóvel: ${imovel.titulo}`,
        complemento: `Admin: ${adminNome}`,
        adminId
      }
    });
    res.status(200).json(imovel);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.patch("/destacar/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  try {
    const imovelAtual = await prisma.imovel.findUnique({ where: { id: Number(id) } });
    const imovel = await prisma.imovel.update({
      where: { id: Number(id) },
      data: { destaque: !imovelAtual?.destaque }
    });
    res.status(200).json(imovel);
  } catch (error) {
    res.status(400).json(error);
  }
});

// ROTA DE PESQUISA
router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params;

  // Tenta converter o termo para número
  const termoNumero = Number(termo);

  // Se o termo NÃO for um número, pesquisa por texto no título ou na categoria
  if (isNaN(termoNumero)) {
    try {
      const imoveis = await prisma.imovel.findMany({
        where: {
          ativo: true,
          OR: [
            { titulo: { contains: termo, mode: "insensitive" } },
            { categoria: { nome: { contains: termo, mode: "insensitive" } } }
          ]
        },
        include: { categoria: true }
      });
      res.status(200).json(imoveis);
    } catch (error) {
      res.status(500).json({ erro: error });
    }
  } else {
    // Se o termo FOR um número, pesquisa por capacidade ou valor da diária
    try {
      const imoveis = await prisma.imovel.findMany({
        where: {
          ativo: true,
          OR: [
            // Se o número for pequeno, provavelmente é a capacidade
            { capacidade: { gte: termoNumero } },
            // Se o número for maior, pode ser o valor máximo da diária
            { valor_diaria: { lte: termoNumero } }
          ]
        },
        include: { categoria: true }
      });
      res.status(200).json(imoveis);
    } catch (error) {
      res.status(500).json({ erro: error });
    }
  }
});

export default router