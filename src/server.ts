import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('⚙️ 🆙 server is running')
})

app.listen(3333, () => {
  console.log('⚙️ 🆙 server is running')
})
