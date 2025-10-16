import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const categoriaSchema = z.object({
  nome: z.string().min(3, {
    message: "O nome da categoria deve possuir, no mínimo, 3 caracteres"
  })
})

router.get("/", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany()
    res.status(200).json(categorias)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = categoriaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }
  const { nome } = valida.data
  try {
    const categoria = await prisma.categoria.create({
      data: { nome }
    })
    res.status(201).json(categoria)
  } catch (error) {
    res.status(400).json({ error })
  }
})

export default router