import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("AI Proxy Alive 🔥");
});

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
                            { type:"text", text:"Detect Malaysian food. Return ONLY JSON array [{name,calories,protein,carbs}]" },
                            { type:"image_url", image_url:{ url:req.body.image } }
                        ]
                    }
                ],
                temperature:0
            })
        });

        const data = await ai.json();

        console.log("OPENAI RAW:", data);

        if(!data?.choices){
            return res.json([]);
        }

        const content = data.choices[0]?.message?.content;

        let parsed = [];

        if(Array.isArray(content)){
            parsed = content;
        }else if(typeof content === "string"){
            try{
                parsed = JSON.parse(content);
            }catch(e){
                console.log("JSON PARSE FAIL:", content);
            }
        }

        res.json(parsed);

    }catch(e){
        console.log("SERVER ERROR:", e);
        res.status(500).json({error:e.message});
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("AI Proxy Running on " + PORT);
});
