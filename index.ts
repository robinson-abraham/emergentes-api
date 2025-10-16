import express from 'express'
import cors from 'cors'

// Adicione as novas importações aqui
import routesAdminLogin from './routes/adminlogin'
import routesAdmins from './routes/admins'

// Mantenha as importações existentes
import routesCategorias from './routes/categorias'
import routesImoveis from './routes/imoveis'
import routesClientes from './routes/clientes'
import routesLogin from './routes/login'
import routesReservas from './routes/reservas'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

// Adicione as novas rotas aqui
app.use("/admins/login", routesAdminLogin)
app.use("/admins", routesAdmins)

// Mantenha as rotas existentes
app.use("/categorias", routesCategorias)
app.use("/imoveis", routesImoveis)
app.use("/clientes", routesClientes)
app.use("/login", routesLogin) // Rota de login para clientes
app.use("/reservas", routesReservas)

app.get('/', (req, res) => {
  res.send('API: Aluguel de Imóveis por Temporada')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})