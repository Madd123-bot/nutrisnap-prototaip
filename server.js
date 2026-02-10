import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// test route
app.get("/", (req, res) => {
  res.send("Gemini Proxy Alive 🔥");
});

app.post("/ai", async (req, res) => {
  try {

    if (!req.body.image) {
      return res.json([]);
    }

    // 🔥 buang prefix base64 (Gemini taknak data:image/...)
    const base64 = req.body.image.replace(/^data:image\/\w+;base64,/, "");

    const ai = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Detect ALL food items in this image individually. Return ONLY JSON array like [{name, calories, protein, carbs}]. No explanation."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64
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

    // 🔥 ambil text result dari Gemini
    let text = "[]";

    try {
      text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    } catch (e) {
      console.log("FORMAT ERROR");
    }

    // 🔥 buang markdown ```json kalau ada
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let result = [];

    try {
      result = JSON.parse(text);
    } catch {
      console.log("JSON PARSE FAIL:", text);
    }

    res.json(result);

  } catch (e) {
    console.log("SERVER ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Gemini Proxy Running on " + PORT);
});
