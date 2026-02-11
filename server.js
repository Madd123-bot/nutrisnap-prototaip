import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ==============================
// 🇲🇾 FOOD TRANSLATOR
// ==============================
function translateFoodName(label){

  const map = {
    "fried rice":"nasi goreng",
    "white rice":"nasi",
    "rice":"nasi",
    "burger":"burger",
    "pizza":"pizza",
    "sandwich":"sandwich",
    "spaghetti":"spageti",
    "noodles":"mee",
    "ramen":"mee",
    "salad":"salad",
    "omelette":"telur",
    "fried chicken":"ayam goreng",
    "grilled chicken":"ayam",
    "chicken curry":"kari ayam"
  };

  const key = label.toLowerCase();
  return map[key] || label;
}

// ==============================
// 🔥 CALORIE DATABASE
// ==============================
function getLocalCalories(name){

  const db = {
    "nasi goreng":630,
    "ayam goreng":320,
    "burger":295,
    "pizza":266,
    "mee":400,
    "nasi":200,
    "kari ayam":350
  };

  return db[name.toLowerCase()] || 250;
}

// ==============================
// TEST ROUTE
// ==============================
app.get("/", (req,res)=>{
  res.send("NutriSnap HF Proxy Alive 🔥");
});

// ==============================
// 🤖 AI ROUTE
// ==============================
app.post("/ai", async (req,res)=>{

  try{

    if(!req.body.image){
      return res.json([]);
    }

    const base64 = req.body.image.replace(/^data:image\/\w+;base64,/, "");

    const ai = await fetch(
      "https://router.huggingface.co/hf-inference/models/nateraw/food",
      {
        method:"POST",
        headers:{
          "Authorization":"Bearer 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",
          "Content-Type":"application/json"
        },
        body: base64
      }
    );

    const data = await ai.json();

    console.log("HF RAW:",data);

    if(!Array.isArray(data)){
      return res.json([]);
    }

    const top = data[0];

    const localName = translateFoodName(top.label);

    // 🔥 RETURN FORMAT SAMA MACAM GEMINI LAMA
    res.json([{
      name: localName,
      calories: getLocalCalories(localName),
      protein: 10,
      carbs: 40
    }]);

  }catch(e){
    console.log("SERVER ERROR:",e);
    res.json([]);
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT,()=>{
  console.log("NutriSnap HF Proxy Running 🔥");
});
