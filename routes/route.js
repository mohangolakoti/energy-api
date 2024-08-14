const express= require('express');

const router=express.Router();


const sensorDataController=require('../controller/controller');


router.post("/sensordata1",sensorDataController.sensordataHandler);

router.get("/sensordata1",sensorDataController.getdataHandler);

module.exports=router;