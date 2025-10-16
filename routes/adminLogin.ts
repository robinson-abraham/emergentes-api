import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const router = Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body
  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    return res.status(400).json({ erro: mensaPadrao })
  }

  try {
    const admin = await prisma.admin.findFirst({ where: { email } })

    if (admin == null) {
      return res.status(400).json({ erro: mensaPadrao })
    }

    if (bcrypt.compareSync(senha, admin.senha)) {
      const token = jwt.sign({
        adminLogadoId: admin.id,
        adminLogadoNome: admin.nome,
        adminLogadoNivel: admin.nivel
      },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      )

      res.status(200).json({
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivel: admin.nivel,
        token
      })
    } else {
      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router