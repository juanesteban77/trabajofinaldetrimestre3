const express = require('express')
const app = express()
const sqlite3=require('sqlite3');
const path = require("path")
const db = new sqlite3.Database('./db/bibliotec.db')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const port = 3000
app.use(express.static(path.join(__dirname, "/public")));
const nodemailer=require('nodemailer');
const cookieParse = require("cookie-parser")
const sessions  = require("express-session")




app.set('view engine', 'ejs');

app.use(cookieParse())
const timeEXp = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "rfghf66a76ythggi87au7td",
    saveUninitialized:true,
    cookie: { maxAge: timeEXp },
    resave: 'welcome to bibliotec'
}));
const transport = nodemailer.createTransport({
  host:'smtp.gmail.com',
  port:587,
  auth:{
    user:'sisibibliotec@gmail.com',
    pass:'kosjlnfjcvmjihxm'
  }
});
app.get('/', (req, res) => {
  res.render('index');
  
  
})

app.post('/registro',(req, res) => {
  let nombre = req.body.nombre;
  let email = req.body.email;
  let password = req.body.password;
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  db.run(`INSERT INTO usuario(nombre,email,password) VALUES (?, ?, ?)`,
  [nombre,email,hash],
    (error) => {
    if(!error){
      console.log("insert ok")
      transport.sendMail({
        from : 'sisibibliotec@gmail.com',
        to: email,
        subject: 'confirma',
        html:'welcome to bibliotec'
      }).then((res)=>{console.log(res);}).catch((err)=>{console.log(err);
      })
      return res.redirect("/login");
  }else{
    console.log("insert error", error.code);
    if (error.code == "QLITE_CONSTRAINT") {
     
       return res.send("el usuario ya existe")
    } 
   
    
  }
  
  

  })
  
})
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  db.get(`SELECT password FROM usuario WHERE email=$email`,{
    $email:email
  }, (error, rows) =>{
    if(error){
      return res.send("Hubo un error al buscar los registros de la base de datos ")
    } 
   if(rows){
    const passBaseDatos = rows.password;

    if(passBaseDatos){
  
      if (bcrypt.compareSync(password, passBaseDatos)){

        session = req.session;
        session.userid = email;
        return   res.redirect("/biblioteca")
      }else{

        return res.send(`Usuario o contraseña incorrecta, <a href=\'/login'>Click</a>`)
      }
    }
   }else{

     return res.send("Usuario o contraseña incorrecta");
   }
    
  })
})

app.post('/administrador', (req, res) => {

  res.render('administrador');
})
app.get('/administrador', (req, res) => {
  res.render('administrador');
})

app.get('/reserva_libro', (req, res) => {

  res.render('reserva_libro');
  
})

app.get('/login', (req, res) => {

  res.render('login');
})

app.post('/registro_admin', (req, res) => {
  res.send('si se registro');
})
app.get('/registro_admin', (req, res) => {
  res.render('registro_admin');
})
app.get('/login_admin', (req, res) => {

  res.render('login_admin');
})

app.post('/login_admin', (req, res) => {

  res.render('login_admin');
})

app.get('/configuracion', (req, res) => {

  res.render('configuracion');
})
app.get('/reserva_exitosa', (req, res) => {

  res.render('reserva exitosa');
})
app.post('/reserva_exitosa',(req, res) => {
  let nombre = req.body.nombre;
  let direccion = req.body.direccion;
  let correo= req.body.correo;
  let fecha_devolucion= req.body.fecha_devolucion;
  db.run(`INSERT INTO reserva(nombre,direccion,correo,fecha_devolucion) VALUES (?, ?, ?, ?)`,
  [nombre,direccion,correo,fecha_devolucion],
    (error) => {
    if(!error){
      console.log("insert ok")
      transport.sendMail({
        from : 'sisibibliotec@gmail.com',
        to:correo,
        subject: 'confirma',
        html: '<h1>Comprobante de reserva</h1> <h3>Presenta este comprobante y asi podras reclamar el libro, no olvides la fecha de devolucion <img src=""/></h3>' 
      }).then((res)=>{console.log(res);}).catch((err)=>{console.log(err);
      })
      return res.send(`su reserva fue exitosa, <a href=\'/biblioteca'>inicio</a>`);
  
    
  }
  
  

  })
  
})
     
    





app.post('/registro_admin',(req, res) => {
  let email_admin= req.body.email.admin;
  let pass_admin= req.body.pass_admin;
  db.run(`INSERT INTO administrador(email_admin,pass_admin) VALUES (?, ?)`,
  [email_admin,pass_admin],
    (error) => {
    if(!error){
      console.log("insert ok")
      res.render("login_admin")
     
  }else{
    console.log("insert fail");
  }
  

  })
  
})
     
  app.post('/login_admin', (req, res) => {
    let email_admin = req.body.email;
    let pass_admin = req.body.password;
      db.get(`SELECT pass_admin FROM administrador WHERE email_admin=$email_admin`,{
        $email_admin:"juanesteban77@gmail.com"
      }, (error, rows) =>{
        if(error){
          return res.send("Hubo un error al buscar los registros de la base de datos ")
        } 
       if(rows){
        const passBaseDatos = rows.pass_admin;
    
        if(passBaseDatos){
      
          if (bcrypt.compareSync(pass_admin, passBaseDatos)){
    
            session = req.session;
            session.userid = email_admin;
            return   res.redirect("/")
          }else{
    
            return res.send(`Usuario o contraseña incorrecta, <a href=\'/login'>Click</a>`)
          }
        }
       }else{
    
         return res.send("Usuario o contraseña incorrecta");
       }
        
      })
    })
      
      

app.get("/biblioteca",(req,res)=>{
  
  session = req.session
  if (session.userid) {
    res.render("index2")
    
  }else{

    res.send("debes inicia sesion")
  }

})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
