import { app } from './app'

app.listen(process.env.PROT || 3333, () => {
  console.log(`⚙️ 🆙 server is running on port ${process.env.PORT}`)
})
