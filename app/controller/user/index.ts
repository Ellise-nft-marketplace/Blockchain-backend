import express, {Request, Response, NextFunction} from 'express';
import User from '../../model/user/User';
/* @ts-ignore */
import {UserInterface, DatabaseUserInterface} from '../../Interfaces';
import {body, check, validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import {IVerifyOptions} from 'passport-local';

let app = express();



// Routes
// app.post('/register', async (req, res) => {
export const signUp = async (req: Request, res: Response) => {
    const { email, password } = req?.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.send("Improper Values");
      return;
    }
    /* @ts-ignore */
    User.findOne({ email }, async (err, doc: DatabaseUserInterface) => {
      if (err) throw err;
      if (doc) res.send("User Already Exists");
      if (!doc) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          email,
          password: hashedPassword,
        });
        await newUser.save();
        // res.send("success")
        return res.status(200).json({
            message: "User authenticated successfully.",
            data: {
            //   token: req.token,
              user: newUser,
            },
          });
      }
    })
  };
  
  const isAdministratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { user }: any = req;
    if (user) {
      User.findOne({ username: user.username }, (err, doc: DatabaseUserInterface) => {
        if (err) throw err;
        if (doc?.isAdmin) {
          next();
        }
        else {
          res.send("Sorry, only admin's can perform this.")
        }
      })
    }
    else {
      res.send("Sorry, you arent logged in.")
    }
  }
  
  // export const logIn  = (req: Request, res: Response) => {
  // // app.post("/login", passport.authenticate("local"), (req, res) => {
  //   passport.authenticate("local") => {

  //   }
  //   res.send("success")
  // };

  export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "email is not valid").isEmail().run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    passport.authenticate("local", (err: Error, user: DatabaseUserInterface, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
            return res.status(500).json({
              message: "Error registering user",
            });
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.status(200).json({
              message: "Login successfull.",
              data: {
              //   token: req.token,
                user: user,
              },
            });
            // req.flash("success", { msg: "Success! You are logged in." });
            // res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};
  
  app.get("/user", (req, res) => {
    res.send(req.user);
  });
  
  app.get("/logout", (req, res) => {
    req.logout();
    res.send("success")
  });
  
  app.post("/deleteuser", isAdministratorMiddleware, async (req, res) => {
    const { id } = req?.body;
    await User.findByIdAndDelete(id, (err) => {
      if (err) throw err;
    });
    res.send("success");
  });
  
  app.get("/getallusers", isAdministratorMiddleware, async (req, res) => {
    await User.find({}, (err, data: DatabaseUserInterface[]) => {
      if (err) throw err;
      const filteredUsers: UserInterface[] = [];
      data.forEach((item: DatabaseUserInterface) => {
        const userInformation = {
          id: item._id,
          username: item.username,
          isAdmin: item.isAdmin
        }
        filteredUsers.push(userInformation);
      });
      res.send(filteredUsers);
    })
  });

  export default app;
