import { useState, useRef } from "react";

const INITIAL_ITEMS = [
  // 衣類
  { id: 1, category: "衣類", name: "肌着（短肌着）", needed: 5, bought: 0, unit: "枚" },
  { id: 2, category: "衣類", name: "肌着（長肌着）", needed: 5, bought: 0, unit: "枚" },
  { id: 3, category: "衣類", name: "コンビ肌着", needed: 5, bought: 0, unit: "枚" },
  { id: 4, category: "衣類", name: "ベビー服（カバーオール）", needed: 5, bought: 0, unit: "枚" },
  { id: 5, category: "衣類", name: "おくるみ", needed: 2, bought: 0, unit: "枚" },
  { id: 6, category: "衣類", name: "靴下", needed: 3, bought: 0, unit: "足" },
  { id: 7, category: "衣類", name: "帽子", needed: 2, bought: 0, unit: "個" },
  // 授乳・哺乳
  { id: 8, category: "授乳・哺乳", name: "哺乳瓶", needed: 3, bought: 0, unit: "本" },
  { id: 9, category: "授乳・哺乳", name: "哺乳瓶消毒セット", needed: 1, bought: 0, unit: "セット" },
  { id: 10, category: "授乳・哺乳", name: "授乳クッション", needed: 1, bought: 0, unit: "個" },
  { id: 11, category: "授乳・哺乳", name: "母乳パッド", needed: 1, bought: 0, unit: "箱" },
  { id: 12, category: "授乳・哺乳", name: "搾乳器", needed: 1, bought: 0, unit: "個" },
  // おむつ・衛生
  { id: 13, category: "おむつ・衛生", name: "紙おむつ（新生児）", needed: 2, bought: 0, unit: "袋" },
  { id: 14, category: "おむつ・衛生", name: "おしりふき", needed: 5, bought: 0, unit: "パック" },
  { id: 15, category: "おむつ・衛生", name: "おむつ替えシート", needed: 2, bought: 0, unit: "枚" },
  { id: 16, category: "おむつ・衛生", name: "ベビーバス", needed: 1, bought: 0, unit: "個" },
  { id: 17, category: "おむつ・衛生", name: "ベビーソープ", needed: 1, bought: 0, unit: "本" },
  { id: 18, category: "おむつ・衛生", name: "ベビーローション", needed: 1, bought: 0, unit: "本" },
  { id: 19, category: "おむつ・衛生", name: "綿棒（ベビー用）", needed: 1, bought: 0, unit: "箱" },
  // 寝具
  { id: 20, category: "寝具", name: "ベビーベッド / 布団セット", needed: 1, bought: 0, unit: "セット" },
  { id: 21, category: "寝具", name: "防水シーツ", needed: 2, bought: 0, unit: "枚" },
  { id: 22, category: "寝具", name: "バスタオル", needed: 5, bought: 0, unit: "枚" },
  // 外出
  { id: 23, category: "外出", name: "ベビーカー", needed: 1, bought: 0, unit: "台" },
  { id: 24, category: "外出", name: "抱っこ紐", needed: 1, bought: 0, unit: "個" },
  { id: 25, category: "外出", name: "チャイルドシート", needed: 1, bought: 0, unit: "個" },
  { id: 26, category: "外出", name: "マザーズバッグ", needed: 1, bought: 0, unit: "個" },
  // 医療・安全
  { id: 27, category: "医療・安全", name: "体温計", needed: 1, bought: 0, unit: "本" },
  { id: 28, category: "医療・安全", name: "爪切り（ベビー用）", needed: 1, bought: 0, unit: "個" },
  { id: 29, category: "医療・安全", name: "鼻水吸い取り器", needed: 1, bought: 0, unit: "個" },
];

const CATEGORIES = [...new Set(INITIAL_ITEMS.map(i => i.category))];

const CATEGORY_COLORS = {
  "衣類": "#f9a8d4",
  "授乳・哺乳": "#86efac",
  "おむつ・衛生": "#93c5fd",
  "寝具": "#c4b5fd",
  "外出": "#fcd34d",
  "医療・安全": "#fb923c",
};

export default function BabyInventory() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const fileRef = useRef();

  const totalNeeded = items.reduce((s, i) => s + i.needed, 0);
  const totalBought = items.reduce((s, i) => s + i.bought, 0);
  const progress = Math.round((totalBought / totalNeeded) * 100);

  const filtered = activeCategory === "すべて"
    ? items
    : items.filter(i => i.category === activeCategory);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setResult(null);

    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

    const itemList = items.map(i => `・${i.name}（現在購入済: ${i.bought}${i.unit}、必要数: ${i.needed}${i.unit}）`).join("\n");

    const prompt = `あなたはベビー用品の在庫管理アシスタントです。
画像を見て、どのベビー用品が写っているか確認してください。

【在庫リスト】
${itemList}

画像に写っているアイテムを特定し、それぞれの数量を数えてください。
必ず以下のJSON形式のみで回答してください（前後に説明文不要）：
{
  "detected": [
    {"name": "アイテム名（リストの名前と一致させる）", "quantity": 数量}
  ],
  "summary": "一言コメント（例：哺乳瓶3本と肌着5枚を確認しました）"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setItems(prev => prev.map(item => {
        const found = parsed.detected?.find(d =>
          item.name.includes(d.name) || d.name.includes(item.name)
        );
        if (found) {
          return { ...item, bought: Math.min(item.bought + found.quantity, item.needed * 2) };
        }
        return item;
      }));

      setResult(parsed.summary || "認識完了しました");
    } catch (err) {
      setResult("認識できませんでした。別の画像をお試しください。");
    }
    setLoading(false);
    e.target.value = "";
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(String(item.bought));
  };

  const commitEdit = (id) => {
    const val = parseInt(editValue);
    if (!isNaN(val) && val >= 0) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, bought: val } : i));
    }
    setEditingId(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff5f7 0%, #fef9ff 50%, #f0f9ff 100%)",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', sans-serif",
      padding: "0 0 80px",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #fb7185, #f472b6, #c084fc)",
        padding: "28px 20px 20px",
        textAlign: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 4px 20px rgba(251,113,133,0.3)",
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🍼</div>
        <h1 style={{ color: "white", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "0.05em" }}>
          ベビー用品 準備リスト
        </h1>
        {/* Progress */}
        <div style={{ marginTop: 14, maxWidth: 320, margin: "14px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.9)", fontSize: 12, marginBottom: 6 }}>
            <span>準備完了</span>
            <span style={{ fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 99, height: 10, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "white",
              borderRadius: 99,
              transition: "width 0.6s cubic-bezier(.4,0,.2,1)"
            }} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 5 }}>
            {totalBought} / {totalNeeded} 品目
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div style={{ padding: "20px 16px 0", maxWidth: 480, margin: "0 auto" }}>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background: loading ? "#e5e7eb" : "linear-gradient(135deg, #fb7185, #c084fc)",
            color: "white",
            border: "none",
            borderRadius: 16,
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 16px rgba(251,113,133,0.4)",
            transition: "all 0.2s",
            letterSpacing: "0.02em",
          }}>
          {loading ? "🔍 画像を認識中..." : "📷 購入品の画像を送る"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />

        {result && (
          <div style={{
            marginTop: 12,
            padding: "12px 16px",
            background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
            borderRadius: 12,
            border: "1px solid #86efac",
            color: "#166534",
            fontSize: 13,
            fontWeight: 500,
          }}>
            ✅ {result}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div style={{
        padding: "16px 16px 0",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
      }}>
        {["すべて", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 99,
              border: "2px solid",
              borderColor: activeCategory === cat ? "#fb7185" : "#e5e7eb",
              background: activeCategory === cat ? "#fb7185" : "white",
              color: activeCategory === cat ? "white" : "#6b7280",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(item => {
          const pct = item.needed > 0 ? Math.min((item.bought / item.needed) * 100, 100) : 0;
          const done = item.bought >= item.needed;
          const color = CATEGORY_COLORS[item.category] || "#d1d5db";

          return (
            <div key={item.id} style={{
              background: done ? "linear-gradient(135deg, #f0fdf4, #ecfdf5)" : "white",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: done ? "0 2px 8px rgba(134,239,172,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
              border: `1px solid ${done ? "#86efac" : "#f3f4f6"}`,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: color, flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: done ? "#15803d" : "#1f2937",
                      textDecoration: done ? "none" : "none",
                    }}>
                      {done ? "✓ " : ""}{item.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(item.id)}
                          onKeyDown={e => e.key === "Enter" && commitEdit(item.id)}
                          autoFocus
                          style={{
                            width: 50, textAlign: "center",
                            border: "2px solid #fb7185", borderRadius: 8,
                            padding: "2px 4px", fontSize: 13, fontWeight: 700, color: "#fb7185"
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(item)}
                          style={{
                            fontSize: 13, fontWeight: 700,
                            color: done ? "#15803d" : "#fb7185",
                            cursor: "pointer",
                            padding: "2px 8px",
                            background: done ? "rgba(134,239,172,0.2)" : "rgba(251,113,133,0.1)",
                            borderRadius: 8,
                          }}>
                          {item.bought}/{item.needed}{item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    marginTop: 8,
                    height: 5,
                    background: "#f3f4f6",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: done
                        ? "linear-gradient(90deg, #86efac, #4ade80)"
                        : `linear-gradient(90deg, ${color}, #fb7185)`,
                      borderRadius: 99,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        textAlign: "center",
        color: "#9ca3af",
        fontSize: 11,
        padding: "8px 0",
      }}>
        数量をタップして手動編集もできます
      </div>
    </div>
  );
}
