import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json({limit:"10mb"}));

app.get("/", (req,res)=>{
    res.send("AI Proxy Alive 🔥");
});

app.post("/ai", async (req,res)=>{
try{

    const ai = await fetch("https://api.openai.com/v1/responses",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
            model:"gpt-4.1-mini",
            input:[
                {
                    role:"user",
                    content:[
                        {
                            type:"input_text",
                            text:"Detect Malaysian food. Return ONLY JSON array [{name,calories,protein,carbs}]"
                        },
                        {
                            type:"input_image",
                            image_url:req.body.image
                        }
                    ]
                }
            ]
        })
    });

    const data = await ai.json();

    console.log("OPENAI RAW:", JSON.stringify(data));

    const text = data.output_text || "[]";

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
    console.log("AI Proxy Running on " + PORT);
});
