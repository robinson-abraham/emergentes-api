/*
  Warnings:

  - You are about to drop the `carros` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marcas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `propostas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."TipoImovel" AS ENUM ('CASA', 'APARTAMENTO', 'CHACARA', 'CABANA');

-- CreateEnum
CREATE TYPE "public"."StatusReserva" AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA');

-- DropForeignKey
ALTER TABLE "public"."carros" DROP CONSTRAINT "carros_marcaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."propostas" DROP CONSTRAINT "propostas_carroId_fkey";

-- DropForeignKey
ALTER TABLE "public"."propostas" DROP CONSTRAINT "propostas_clienteId_fkey";

-- DropTable
DROP TABLE "public"."carros";

-- DropTable
DROP TABLE "public"."marcas";

-- DropTable
DROP TABLE "public"."propostas";

-- DropEnum
DROP TYPE "public"."Combustiveis";

-- CreateTable
CREATE TABLE "public"."categorias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."imoveis" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "quartos" SMALLINT NOT NULL,
    "capacidade" SMALLINT NOT NULL,
    "valor_diaria" DECIMAL(10,2) NOT NULL,
    "foto" TEXT NOT NULL,
    "comodidades" TEXT,
    "tipo" "public"."TipoImovel" NOT NULL DEFAULT 'CASA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reservas" (
    "id" SERIAL NOT NULL,
    "clienteId" VARCHAR(36) NOT NULL,
    "imovelId" INTEGER NOT NULL,
    "data_checkin" TIMESTAMP(3) NOT NULL,
    "data_checkout" TIMESTAMP(3) NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "status" "public"."StatusReserva" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "public"."clientes"("email");

-- AddForeignKey
ALTER TABLE "public"."imoveis" ADD CONSTRAINT "imoveis_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservas" ADD CONSTRAINT "reservas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservas" ADD CONSTRAINT "reservas_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "public"."imoveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
