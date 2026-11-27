module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "طريقة الطلب غير مسموحة" });
  }

  try {
    const { question } = req.body || {};

    if (!question || typeof question !== "string" || question.length > 2000) {
      return res.status(400).json({ error: "اكتب سؤالًا صحيحًا لا يتجاوز 2000 حرف." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-6.2-sol",
        instructions: `أنت مساعد إسلامي متخصص في الإجابة عن الأسئلة الدينية فقط.
اعتمد على القرآن الكريم والسنة الصحيحة والمصادر الإسلامية الموثوقة.
اذكر الدليل ومصدره عند القدرة على التحقق منه.
لا تخترع آيات أو أحاديث أو أحكامًا أو أسماء كتب.
لا تنسب حديثًا إلى النبي ﷺ دون التأكد من مصدره ودرجته.
إذا لم تتأكد من صحة المعلومة فصرح بذلك وقل: لا أعلم على وجه اليقين.
وضح الخلاف الفقهي المعتبر ولا تقدم رأيًا واحدًا باعتباره محل إجماع.
أحل المسائل المعقدة إلى أهل العلم المختصين.
ارفض بأدب الإجابة عن الأسئلة غير الدينية.
أجب باللغة العربية الواضحة.`,
        input: question,
        max_output_tokens: 1000
      })
    });

    const data = await response.json();

    if (!response.ok) {
  return res.status(response.status).json({
    error: data.error?.message || "حدث خطأ في الاتصال."
  });
    }

    const answer = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "حدث خطأ، حاول مرة أخرى." });
  }
};
