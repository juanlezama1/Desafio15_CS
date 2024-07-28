import { Router } from "express"
import { userModel } from '../models/users.js'
import { createHash, comparePSW } from "../utils/bcrypt.js"
import passport from "passport"

// Devolverá el usuario en req.user, en caso de éxito.
const sessionsRouter = Router ()

// Ruta para cargar una sesión activa en caso de login exitoso.
// Primero se ejecuta una función middleware (passport.authenticate) y luego se ejecuta la función callback que
// trabaja en base a lo que previamente procesó el middleware. Sólo entra al callback si se logueó con éxito!

sessionsRouter.post('/login', passport.authenticate('login'), async (req, res) => {

    // Sólo entra a este callback si el logueo fue exitoso, caso contrario dirá "Unauthorized" con código 401
    // Si es exitoso, req.user tendrá al usuario que se logueó.
    // Finalmente, el usuario quedará alojado en req.session.user

    try {
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email
        }

        // Si llegó a esta altura, se logueó correctamente, lo envío a la página principal
        res.redirect('/')
    }

    catch (error)

    {
        res.status(500).send("Error al loguear usuario")
    }
})

// Ruta para registrar un usuario.
// Sólo accede a la función de callback si regresa con éxito desde el middleware (con un done que devolvió true)
// En mi caso, vuelve siempre, y req.user valdrá 'previosly_registered' ó 'registered' según sea el caso

sessionsRouter.post('/register', passport.authenticate('register'), async (req, res) => {
    try {
        if (req.user === 'previously_registered')
        {
            return res.status(401).send("Usuario ya existente en la aplicación")
        }

        else 
        {
            res.status(200).send("Usuario creado correctamente")
        }
    }

    catch (error)

    {
        res.status(500).send("Error al registrar usuario")
    }
})

// Ruta para registro de un usuario por GET (visual)
sessionsRouter.get('/register', async (req, res) => {
    
    res.status(200).render('templates/user_registration')
})

// Ruta para registro de un usuario por GET (visual)
sessionsRouter.get('/login', async (req, res) => {

    res.status(200).render('templates/user_login')
})

// Ruta para eliminar una sesión activa
sessionsRouter.get('/logout', async (req, res) => {
    try {
        req.session.destroy()

        // Usuario finalizó su sesión, lo envío a la página principal
        res.redirect('/')
    }

    catch (error)

    {
        res.status(500).send("Error al finalizar sesión!")
    }
})

// Ruta para autenticarme a través de GitHub. 
sessionsRouter.get('/github', passport.authenticate('github', {scope: ['user:email']}), async (req, res) => {})

// Ruta de callback, una vez autenticado a través de GitHub
sessionsRouter.get('/githubSession', passport.authenticate('github'), async (req, res) => {

    // Ahora tengo los datos de mi usuario guardados en req.session.passport.user
    // Igualmente los guardaré en req.session.user

    try {
        req.session.user = {
            email: req.user.email,
            name: req.user.first_name 
        }

        // Cliente autenticado con éxito, lo envío a la página principal
        res.redirect('/')
    }

    catch (error)

    {
        res.status(500).send("Error al loguear usuario con GitHub")
    }
}) 

// Ruta para autenticarme a través de JWT
// El parámetro session:false sirve para indicar que NO se cree una sesión de usuario
// en el servidor/DB ya que, justamente, se utiliza JWT para este fin

// Pasos:
// 1) ENTRO POR GET
// 2) ACCEDO AL MÉTODO DE AUTENTICACIÓN POR PASSPORT
// 3) EXTRAIGO LA COOKIE jwtCookie (encriptada y firmada con una contraseña en particular)
// 4) SI LA COOKIE ES JWT Y ESTÁ FIRMADA CON LA CONTRASEÑA, VEO EL CONTENIDO DE LA COOKIE
// 5) CORRESPONDE A UN USUARIO, SACO SU ID
// 6) LO BUSCO EN LA DB CON ESE ID, Y SI EXISTE, LO DEVUELVO
// 7) Y, SI LO DEVOLVÍ, IMPRIMO EL CÓDIGO EN PANTALLA Y MANDO UN STATUS 200 CON EL USUARIO EN CUESTIÓN

sessionsRouter.get('/testJWT', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).send(req.user)
})

sessionsRouter.get('/current', async (req, res) => {
    res.status(200).send(req.session.user)

})

export default sessionsRouter