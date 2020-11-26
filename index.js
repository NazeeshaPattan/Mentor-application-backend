const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://NazeeshaPattan:Nazeesha123#@cluster0.pjz0i.mongodb.net/<dbname>?retryWrites=true&w=majority";
const cors = require('cors');

app.options('*', cors())


app.use(bodyParser.json());

app.get("/",cors(), (req,res)=>{
    res.send("Hello From Server");
});

app.get("/student", cors(), async function(req,res){
    try {
        let client = await mongoClient.connect(url);
    let db = client.db("mentorassignment");
    let studentList = await db.collection("students").find().toArray();
    client.close();
    res.json(studentList);
    } catch (error) {
      res.json({
          message : "Something Went wrong"
      })  
    }
})

app.post("/student",cors(), async function (req,res){
   try {
    let client  = await mongoClient.connect(url);
    let db = client.db("mentorassignment");
   await db.collection("students").insertOne({
    name : req.body.name,
    id : req.body.id,
    contact : req.body.contact,
    batch : req.body.batch,
    mentorAssigned : false,
    mentorName : "Not Assigned"
});
   client.close();
   res.json({
       message : "Student Added Successfully!"
   })
   } catch (error) {
       res.json({
           message : "Something Went Wrong"
       })
   }
})

app.post("/mentor",cors(), async function(req,res){
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("mentorassignment");
        let inserted = await db.collection("mentors").insertOne({
            name : req.body.name,
            id : req.body.id,
            contact : req.body.contact,
            studentList : []
        });
        console.log(inserted + " Inserted");
        client.close();
        res.json({
            message : "Mentor Added Successfully!"
        })
    } catch (error) {
        res.json({
            message : "Something Went wrong"
        })
    }
})

app.get("/mentor",cors(), async function(req,res){
    try {
        let client = await mongoClient.connect(url);
    let db = client.db("mentorassignment");
    let mentorList = await db.collection("mentors").find().toArray();
    client.close();
    res.json(mentorList);
    } catch (error) {
      res.json({
          message : "Something Went wrong"
      })  
    }
})


app.put('/mentor/assignStudent',cors(), async function(req,res){
    try {
        let client = await mongoClient.connect(url);
        let db = client.db('mentorassignment');
        await db.collection('mentors').findOneAndUpdate({name : req.body.mentor},{$push: {studentList : req.body.studentName}});
        await db.collection('students').findOneAndUpdate({name : req.body.studentName}, {$set : {mentorAssigned : true}});
        await db.collection('students').findOneAndUpdate({name : req.body.studentName}, {$set : {mentorName : req.body.mentor }});
        client.close();
    } catch (error) {
        console.log(error);
    }
})

app.put('/mentor/UpdateMentor',cors(), async function(req,res){
    try {
        let client = await mongoClient.connect(url);
        let db = client.db('mentorassignment');
        await db.collection('mentors').findOneAndUpdate({name : req.body.OldMentor},{$pull: {studentList : req.body.studentName}});
        await db.collection('mentors').findOneAndUpdate({name : req.body.NewMentor},{$push: {studentList : req.body.studentName}});
        await db.collection('students').findOneAndUpdate({name : req.body.studentName}, {$set : {mentorAssigned : true}});
        await db.collection('students').findOneAndUpdate({name : req.body.studentName}, {$set : {mentorName : req.body.NewMentor }});
        client.close();
    } catch (error) {
        console.log(error);
    }
})

app.listen(process.env.PORT || 3000);