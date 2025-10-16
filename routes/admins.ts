import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

// Adicione aqui a função validaSenha do seu arquivo clientes.ts se quiser
// ou uma validação mais simples por enquanto.

router.post("/", async (req, res) => {
  const { nome, email, senha, nivel } = req.body;

  // Criptografa a senha antes de salvar
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(senha, salt);

  try {
    const admin = await prisma.admin.create({
      data: { nome, email, senha: hash, nivel: Number(nivel) }
    });
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const admins = await prisma.admin.findMany();
    res.status(200).json(admins);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;