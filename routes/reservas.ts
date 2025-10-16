import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const reservaSchema = z.object({
  clienteId: z.string().uuid(),
  imovelId: z.number().int(),
  data_checkin: z.string().transform((str) => new Date(str)),
  data_checkout: z.string().transform((str) => new Date(str)),
})

router.get("/cliente/:clienteId", async (req, res) => {
    const { clienteId } = req.params;
    try {
      const reservas = await prisma.reserva.findMany({
        where: { clienteId },
        include: {
          imovel: {
            include: {
              categoria: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(reservas);
    } catch (error) {
      res.status(400).json(error);
    }
});
  
router.post("/", async (req, res) => {
    const result = reservaSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ erro: result.error.issues });
    }
  
    const { clienteId, imovelId, data_checkin, data_checkout } = result.data;
  
    try {
      const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } });
      if (!imovel) {
        return res.status(404).json({ erro: "Imóvel não encontrado" });
      }
  
      const diffTime = Math.abs(data_checkout.getTime() - data_checkin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return res.status(400).json({ erro: "A data de checkout deve ser posterior à de check-in." });
      }
  
      const valor_total = diffDays * Number(imovel.valor_diaria);
  
      const reserva = await prisma.reserva.create({
        data: { clienteId, imovelId, data_checkin, data_checkout, valor_total }
      });
      res.status(201).json(reserva);
    } catch (error) {
      res.status(400).json(error);
    }
});

export default router