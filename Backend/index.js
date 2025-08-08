const express = require("express")
const fetchData = require("./routes/fetchData")
const cors = require("cors")

const app = express()
const port = process.env.PORT || 3000
const router =express.Router()

app.use(cors({origin: process.env.CLIENT_URL || "*"}))
app.use(express.json())

router.use("/fetch", fetchData)
app.use("/", router)

app.listen(port, () => console.log(`Express server listening on port ${port}`))
