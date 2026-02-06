import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json());
app.post("/ai", async (req,res)=>{

```
try{

    const r = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + process.env.OPENAI_KEY
        },
        body: JSON.stringify(req.body)
    });

    const data = await r.json();
    res.json(data);

}catch(e){
    res.status(500).json({error:e.message});
}
```

});

app.listen(3000,()=>{
console.log("AI Proxy Running");
});
