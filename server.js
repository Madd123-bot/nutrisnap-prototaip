import express from "express";
import cors from "cors";

const app = express();

app.get("/",(req,res)=>{
    res.send("AI Proxy Alive 🔥");
});

app.use(cors());
app.use(express.json());
app.post("/ai", async (req,res)=>{

try{

    const ai = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
            model:"gpt-4.1-mini",
            messages:[
                {
                    role:"user",
                    content:[
                        { type:"text", text:"Detect food and return JSON array with name, calories, protein, carbs" },
                        { type:"image_url", image_url:{ url:req.body.image } }
                    ]
                }
            ]
        })
    });

    const data = await ai.json();

    const text = data.choices?.[0]?.message?.content || "[]";

    res.json(JSON.parse(text));

}catch(e){
    console.log(e);
    res.status(500).json({error:e.message});
}

});


app.listen(3000,()=>{
    console.log("AI Proxy Running");
});
