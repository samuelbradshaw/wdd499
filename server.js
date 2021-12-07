require('dotenv').config();
const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 5000

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const secretKey = process.env.SECRET

// Configuration
app.set('json spaces', 2)
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(express.static(path.join(__dirname, 'dist')))
  .use(cookieParser())

app.use(function (req, res, next) {
  console.log(req.method + " " + req.url);
  next();
});

// Authentication
// https://www.section.io/engineering-education/session-management-in-nodejs-using-expressjs-and-express-session/
// https://www.codexpedia.com/node-js/a-very-basic-session-auth-in-node-js-with-express-js/
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: secretKey,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false,
}));
var session;
var auth = function(req, res, next) {
  if (req.session && req.session.user === req.params.unitSlug) {
    return next()
  } else {
    return res.sendStatus(401)
  }
};

// MySQL
const mysql = require('mysql')
var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dateStrings: true,
})
con.connect(function(err) {
  if (err) throw err
  console.log('Connected to database.')
})


// See https://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
// Add headers before the routes are defined
// TODO: Make sure this is secure on server
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// FUNCTIONS

function getUnits(callback) {
  let data = []
  con.query(`SELECT unitSlug, unitName FROM Unit
            ORDER BY unitName`,
    (err, rows) => {
      if (err) throw err
      data = rows
      callback(data)
    })
}

function getUnit(unitSlug, callback) {
  const data = {
    unitSlug: '',
    unitName: '',
    programDates: [],
  }
  con.query(`SELECT Unit.unitSlug, unitName, programDate FROM Unit
            LEFT JOIN Program ON Unit.unitSlug = Program.unitSlug
            WHERE Unit.unitSlug = ?
            ORDER BY programDate DESC`, [unitSlug],
    (err, rows) => {
      if (err) throw err

      data.unitSlug = rows?.[0]?.unitSlug ?? ''
      data.unitName = rows?.[0]?.unitName ?? ''
      for (const row of rows) {
        if (row.programDate) data.programDates.push(row.programDate)
      }
      callback(data)
    })
}

function getProgram(unitSlug, programDate, callback) {
  let data = {}
  con.query(`SELECT programJson FROM Program
            WHERE unitSlug = ? AND programDate = ?
            LIMIT 1`, [unitSlug, programDate],
    (err, rows) => {
      if (err) throw err

      data = JSON.parse(rows?.[0]?.programJson ?? '{}')
      callback(data)
    })
}

function createProgram(unitSlug, programDate, programJson, callback) {
  con.query(`INSERT IGNORE INTO Program (unitSlug, programDate, programJson)
            VALUES (?, ?, ?)`, [unitSlug, programDate, JSON.stringify(programJson)],
    (err, result) => {
      let status = 200
      if (result.affectedRows == 1) { // New record created
        status = 201
      } else if (err) {
        console.log(err)
        status = 500
      }
      callback(status)
    })
}

function updateProgram(unitSlug, programDate, programJson, callback) {
  con.query(`UPDATE Program SET programJson = ?
            WHERE unitSlug = ? AND programDate = ?`, [JSON.stringify(programJson), unitSlug, programDate],
    (err, result) => {
      let status = 200
      if (err) {
        console.log(err)
        status = 500
      }
      callback(status)
    })
}

function getDefaultProgramData(unitSlug, newDate, basedOnDate, callback) {
  const programData = {
    printOptions: {
      lang: 'en-US',
      style: 'traditional'
    },
    general: {
      date: '',
      startTime: '',
      wardName: '',
      stakeName: '',
      epigraph: '',
      epigraphCitation: '',
      imageUrl: ''
    },
    header: {
      presiding: '',
      conducting: '',
      musicLeader: '',
      accompanist: ''
    },
    proceedings: {
      testimonyMeeting: false,
      sacramentAtEnd: false,
      welcome: true,
      openingHymn: '',
      closingHymn: '',
      sacramentHymn: '',
      openingPrayer: '',
      closingPrayer: '',
      wardBusiness: [
        { title: '', details: '' }
      ],
      orderedItems: [
        { title: '', details: '', subtitle: '' }
      ]
    },
    secondHour: [
      { meeting: '', location: '' }
    ]
  }

  if (basedOnDate) {
    getProgram(unitSlug, basedOnDate, (data) => {
      programData.printOptions = data.printOptions
      programData.general = data.general
      programData.header = data.header
      programData.general.date = newDate
      callback(programData)
    })
  } else {
    getUnit(unitSlug, (data) => {
      programData.general.wardName = data.unitName
      programData.general.date = newDate
      callback(programData)
    })
  }
}


// ROUTES

app.get('/', (req, res) => {
  session=req.session;
  if (session.user) {
    res.send('Signed in');
  } else {
    res.sendFile('index.html')
  }
})

app.post('/api/v1/signin', (req, res) => {
  const providedUnitSlug = req.body.unitSlug
  const providedUnitPassphrase = req.body.unitPassphrase

  con.query(`SELECT unitSlug, unitPassphrase FROM Unit
            WHERE unitSlug = ?
            LIMIT 1`, [providedUnitSlug],
    (err, rows) => {
      if (err) throw err

      if (rows?.[0]?.unitSlug == providedUnitSlug && rows?.[0]?.unitPassphrase == providedUnitPassphrase) {
        session = req.session;
        session.user = providedUnitSlug;
        console.log(req.session)
        res.status(200)
        res.send('Signed in')
      } else {
        res.status(401)
        res.send('Invalid username or password')
      }
    })
})

app.get('/api/v1/signout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/api/v1/units', (req, res) => {
  getUnits((data) => {
    res.json(data)
  })
})

app.get('/api/v1/units/:unitSlug', (req, res) => {
  const unitSlug = req.params.unitSlug
  getUnit(unitSlug, (data) => {
    // TODO: Make sure authentication is correct in prod
    data.allowEdit = (req.session && req.session.user === req.params.unitSlug)
    res.json(data)
  })
})

app.get('/api/v1/units/:unitSlug/:programDate', (req, res) => {
  const unitSlug = req.params.unitSlug
  const programDate = req.params.programDate
  getProgram(unitSlug, programDate, (data) => {
    res.json(data)
  })
})

// Create a new program
app.post('/api/v1/units/:unitSlug', auth, (req, res) => {
  const unitSlug = req.params.unitSlug // TODO: Clean/validate slug and date
  const programDate = req.body.programDate
  const basedOnDate = req.body.basedOnDate

  getDefaultProgramData(unitSlug, programDate, basedOnDate, (programJson) => {
    createProgram(unitSlug, programDate, programJson, (status) => {
      res.status(status)
      getUnit(unitSlug, (data) => {
        res.json(data)
      })
    })
  })
})

// Update an existing program
app.put('/api/v1/units/:unitSlug/:programDate', auth, (req, res) => {
  const unitSlug = req.params.unitSlug // TODO: Clean/validate slug and date
  const programDate = req.params.programDate
  const programJson = req.body

  updateProgram(unitSlug, programDate, programJson, (status) => {
    res.status(status)
    getProgram(unitSlug, programDate, (data) => {
      res.json(data)
    })
  })
})



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

// con.end((err) => { })
