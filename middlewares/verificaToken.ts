import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from 'express'

type TokenType = {
  adminLogadoId: string
  adminLogadoNome: string
  adminLogadoNivel: number
}

declare global {
  namespace Express {
    interface Request {
      adminLogadoId?: string
      adminLogadoNome?: string
      adminLogadoNivel?: number
    }
  }
}

export function verificaToken(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({ error: "Token não informado" })
  }

  const token = authorization.split(" ")[1]

  try {
    const decode = jwt.verify(token, process.env.JWT_KEY as string)
    const { adminLogadoId, adminLogadoNome, adminLogadoNivel } = decode as TokenType

    req.adminLogadoId = adminLogadoId
    req.adminLogadoNome = adminLogadoNome
    req.adminLogadoNivel = adminLogadoNivel

    next()
  } catch (error) {
    res.status(401).json({ error: "Token inválido" })
  }
}