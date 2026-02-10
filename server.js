import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req,res)=>{
    res.send("AI Proxy Gemini Alive 🔥");
});

app.post("/ai", async (req,res)=>{
try{

    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    const ai = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_KEY,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                contents:[
                    {
                        parts:[
                            {
                                text:"Detect all food ingredients in this image. Return ONLY JSON array [{name,calories,protein,carbs}]"
                            },
                            {
                                inlineData:{
                                    mimeType:"image/jpeg",
                                    data:req.body.image.split(",")[1] // buang base64 header
                                }
                            }
                        ]
                    }
                ]
            })
        }
    );

    const data = await ai.json();

    console.log("GEMINI RAW:", JSON.stringify(data));

    let text = "[]";

    try{
        text = data.candidates[0].content.parts[0].text || "[]";
    }catch{
        console.log("FORMAT ERROR");
    }

    let result = [];
    try{
        result = JSON.parse(text);
    }catch{
        console.log("JSON PARSE FAIL:", text);
    }

    res.json(result);

}catch(e){
    console.log("SERVER ERROR:",e);
    res.status(500).json({error:e.message});
}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Gemini Proxy Running on " + PORT);
});
