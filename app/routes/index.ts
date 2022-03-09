import express from 'express';
import user from '../controller/user';

let router = express();

router.use('/user', user);


export default router;