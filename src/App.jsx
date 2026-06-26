import { useState, useEffect, useRef } from "react";

// ─── Supabase config ──────────────────────────────────────────
const SUPABASE_URL = "https://umhfmhvzttifqdenriwq.supabase.co";
const SUPABASE_KEY = "sb_publishable_p5H4tjNv8q0Wta_OuRugwA_CE8NLcev";

const supabase = {
  async signUp(email, password, metadata) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password, data: metadata })
    });
    return res.json();
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
    });
  },

  async getMessages(contactId, token) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?or=(sender_id.eq.${contactId},receiver_id.eq.${contactId})&order=created_at.asc`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` } }
    );
    return res.json();
  },

  async sendMessage(msg, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(msg)
    });
    return res.json();
  },

  async getPosts(token) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/community_posts?order=created_at.desc&limit=20`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` } }
    );
    return res.json();
  },

  async createPost(post, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(post)
    });
    return res.json();
  },

  async saveHumeur(data, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/humeur_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getHumeur(userId, token) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/humeur_logs?user_id=eq.${userId}&order=created_at.desc&limit=7`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` } }
    );
    return res.json();
  },

  subscribeToMessages(callback) {
    // Realtime via websocket
    const ws = new WebSocket(
      `wss://umhfmhvzttifqdenriwq.supabase.co/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`
    );
    ws.onopen = () => {
      ws.send(JSON.stringify({
        topic: "realtime:public:messages",
        event: "phx_join",
        payload: {},
        ref: "1"
      }));
    };
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === "INSERT") callback(data.payload.record);
    };
    return ws;
  }
};


// ─── Design tokens (lilas pastel + vert doux, style Animal Crossing doux) ───
const C = {
  bg: "#F4F0FA",
  bgCard: "#FFFFFF",
  purple: "#8B6FC6",
  purpleLight: "#C4AEE8",
  purplePale: "#EDE8F8",
  green: "#7BBF9A",
  greenPale: "#E4F5EC",
  orange: "#F4A261",
  orangePale: "#FEF0E4",
  pink: "#E891B0",
  pinkPale: "#FDEAF2",
  yellow: "#F7C948",
  yellowPale: "#FEF9E4",
  text: "#2A2540",
  muted: "#8A84A3",
  border: "#E8E2F5",
  white: "#FFFFFF",
  urgent: "#E05A5A",
};

// ─── Screens ─────────────────────────────────────────────────
const S = {
  HOME: "home",
  QUESTS: "quests", GAME: "game", BREATHE: "breathe",
  SCAN: "scan", JOURNAL: "journal", GRATITUDE: "gratitude", COGNITIF: "cognitif",
  COMMUNAUTE: "communaute", HUMEUR: "humeur", URGENCES: "urgences", RAPPELS: "rappels",
  CHAT: "chat", CHAT_ROOM: "chat_room", LIVE: "live",
  RESOURCES: "resources", FICHE: "fiche", PROFILE: "profile",
};

// ─── Data ─────────────────────────────────────────────────────
const QUESTS = [
  { id: 1, icon: "💧", label: "Boire un verre d'eau", coins: 5, done: false },
  { id: 2, icon: "🚿", label: "Prendre une douche", coins: 10, done: false },
  { id: 3, icon: "🌿", label: "Sortir 5 minutes", coins: 10, done: false },
  { id: 4, icon: "👕", label: "S'habiller", coins: 5, done: false },
  { id: 5, icon: "🍽️", label: "Manger quelque chose", coins: 10, done: false },
  { id: 6, icon: "📖", label: "Lire une ressource utile", coins: 15, done: false },
  { id: 7, icon: "🎵", label: "Écouter une musique que j'aime", coins: 5, done: false },
];

const CONTACTS = [
  { id: 1, name: "Dr. Sophie Martin", role: "Psychiatre", specialty: "Anxiété · Dépression", available: true, color: C.purple, expert: false },
  { id: 2, name: "Léa R.", role: "Pair-aidante", specialty: "A vécu un épisode dépressif majeur", available: true, color: C.green, expert: true },
  { id: 3, name: "Kevin B.", role: "Bénévole écoute", specialty: "Formation écoute active", available: true, color: C.orange, expert: false },
  { id: 4, name: "Dr. Marc Lefebvre", role: "Psychologue", specialty: "Trauma · TCC", available: false, color: C.pink, expert: false },
  { id: 5, name: "Asso. Psycom", role: "Association nationale", specialty: "Droits · Orientation", available: true, color: C.purple, expert: false },
];

const LIVES = [
  { id: 1, icon: "🎙️", title: "Comprendre l'anxiété", who: "Dr. Sophie Martin — Psychiatre", when: "Aujourd'hui 18h", live: true },
  { id: 2, icon: "💬", title: "Témoignage : reprendre pied après une dépression", who: "Léa R. — Pair-aidante", when: "Demain 14h", live: false },
  { id: 3, icon: "🧠", title: "TCC : les bases en pratique", who: "Dr. Marc Lefebvre — Psychologue", when: "Jeudi 17h", live: false },
  { id: 4, icon: "🤝", title: "Trouver du soutien associatif", who: "Psycom", when: "Vendredi 12h", live: false },
];

const FICHES = [
  {
    id: 1, icon: "😔", title: "Dépression", color: C.purplePale, border: C.purple,
    symptomes: ["Tristesse persistante", "Perte d'intérêt", "Fatigue intense", "Troubles du sommeil", "Difficultés de concentration"],
    traitements: ["Psychothérapie (TCC)", "Antidépresseurs si nécessaire", "Activité physique adaptée"],
    ressources: ["3114 — Prévention suicide", "Psycom.fr", "Mon médecin traitant"],
  },
  {
    id: 2, icon: "😰", title: "Anxiété", color: C.orangePale, border: C.orange,
    symptomes: ["Inquiétudes excessives", "Tensions musculaires", "Palpitations", "Évitement de situations", "Troubles du sommeil"],
    traitements: ["TCC", "Techniques de relaxation", "Médication si besoin"],
    ressources: ["Anxiété.fr", "Application de respiration", "Médecin traitant"],
  },
  {
    id: 3, icon: "🌊", title: "Trouble bipolaire", color: C.pinkPale, border: C.pink,
    symptomes: ["Alternance humeur haute/basse", "Épisodes d'euphorie", "Épisodes dépressifs", "Impulsivité"],
    traitements: ["Stabilisateurs de l'humeur", "Suivi psychiatrique régulier", "Psychoéducation"],
    ressources: ["UNAFAM", "Psycom.fr", "Psychiatre référent"],
  },
  {
    id: 4, icon: "💭", title: "Schizophrénie", color: C.greenPale, border: C.green,
    symptomes: ["Hallucinations", "Délires", "Désorganisation", "Repli sur soi", "Difficultés cognitives"],
    traitements: ["Antipsychotiques", "Suivi psychiatrique", "Réhabilitation psychosociale"],
    ressources: ["UNAFAM", "Centre médico-psychologique", "Équipe mobile psychiatrie"],
  },
];

const MEDICAMENTS = [
  { nom: "Sertraline (Zoloft)", famille: "ISRS — Antidépresseur", indications: "Dépression, anxiété, TOC", effets_freq: ["Nausées", "Insomnie", "Fatigue"], effets_rares: ["Agitation", "Prise de poids"], precautions: "Ne pas arrêter brutalement. Effet en 2-4 semaines." },
  { nom: "Alprazolam (Xanax)", famille: "Benzodiazépine — Anxiolytique", indications: "Anxiété aiguë, crises de panique", effets_freq: ["Somnolence", "Dépendance possible"], effets_rares: ["Confusion", "Mémoire"], precautions: "Usage court terme uniquement. Risque de dépendance." },
  { nom: "Lithium", famille: "Stabilisateur de l'humeur", indications: "Trouble bipolaire", effets_freq: ["Tremblements légers", "Soif", "Polyurie"], effets_rares: ["Toxicité rénale"], precautions: "Suivi sanguin régulier obligatoire." },
];

const URGENCES = [
  { nom: "Urgences psychiatriques CHU", ville: "Paris 13e", tel: "01 42 16 00 00", ouvert: "24h/24" },
  { nom: "CMP — Centre médico-psychologique", ville: "Paris 11e", tel: "01 43 67 12 34", ouvert: "Lun-Ven 9h-17h" },
  { nom: "Clinique des Lilas", ville: "Les Lilas (93)", tel: "01 49 72 72 00", ouvert: "24h/24" },
];

// ─── Components ───────────────────────────────────────────────

function Tag({ label, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "3px 8px", borderRadius: 20, letterSpacing: "0.03em" }}>
      {label}
    </span>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.bgCard, borderRadius: 20, padding: 16,
      boxShadow: "0 2px 12px rgba(139,111,198,0.08)",
      border: `1px solid ${C.border}`,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = C.purple, style = {}, small = false }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: "#fff", border: "none", borderRadius: 50,
      padding: small ? "8px 18px" : "12px 28px",
      fontSize: small ? 13 : 15, fontWeight: 700, cursor: "pointer",
      boxShadow: `0 4px 14px ${color}44`, ...style,
    }}>
      {children}
    </button>
  );
}

function BackBtn({ onBack }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", color: C.purple, fontWeight: 700, fontSize: 15, cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>
      ← Retour
    </button>
  );
}

// ─── Screens ──────────────────────────────────────────────────

function HomeScreen({ setScreen, quests, coins, user }) {
  const done = quests.filter(q => q.done).length;
  return (
    <div style={{ padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Bonjour {user?.prenom || ""} 🌸</div>
          <div style={{ fontSize: 13, color: C.muted }}>Comment tu vas aujourd'hui ?</div>
        </div>
        <button onClick={() => setScreen(S.PROFILE)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 2px 8px ${C.purple}66` }}>
            🌸
          </div>
        </button>
      </div>

      {/* PsychoCoins */}
      <Card style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`, border: "none", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>MES PSYCHOCOINS</div>
            <div style={{ color: "#fff", fontSize: 32, fontWeight: 800 }}>🪙 {coins}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Quêtes du jour</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{done}/{quests.length}</div>
          </div>
        </div>
      </Card>

      {/* Urgence */}
      <Card style={{ background: "#FFF0F0", border: `1px solid ${C.urgent}33`, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🆘</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.urgent, fontSize: 15 }}>3114 — Prévention suicide</div>
            <div style={{ fontSize: 12, color: C.muted }}>Gratuit · 24h/24 · Confidentiel</div>
          </div>
          <Btn small color={C.urgent} style={{ padding: "8px 14px" }}>Appeler</Btn>
        </div>
      </Card>

      {/* Nav grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { icon: "🎮", label: "Activités", sub: "Exercices & jeux", s: S.GAME, color: C.purple },
          { icon: "🗺️", label: "Quêtes", sub: `${done}/${quests.length} aujourd'hui`, s: S.QUESTS, color: C.green },
          { icon: "💬", label: "Parler", sub: "Soignants & pairs", s: S.CHAT, color: C.orange },
          { icon: "📚", label: "Ressources", sub: "Fiches & guides", s: S.RESOURCES, color: C.pink },
        ].map(item => (
          <Card key={item.s} onClick={() => setScreen(item.s)} style={{ borderTop: `3px solid ${item.color}`, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginTop: 4 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.sub}</div>
          </Card>
        ))}
      </div>

      {/* Lives */}
      <div style={{ marginBottom: 20 }}>
        <Card onClick={() => setScreen(S.LIVE)} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 32 }}>🎙️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Lives avec des professionnels</div>
            <div style={{ fontSize: 12, color: C.muted }}>2 à 3 par semaine</div>
          </div>
          <span style={{ marginLeft: "auto", color: C.purple }}>→</span>
        </Card>
      </div>

      {/* Conseil */}
      <Card style={{ background: C.purplePale, border: "none" }}>
        <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
          ✨ <strong>Se lever le matin, c'est déjà beaucoup.</strong> Cette appli ne récompense pas la performance. Elle valorise ta présence, tes petits pas, et ta persévérance.
        </p>
      </Card>
    </div>
  );
}

function QuestsScreen({ onBack, quests, setQuests, addCoins, mode }) {
  const done = quests.filter(q => q.done).length;
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Quêtes du jour 🗺️</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Simples, facultatives, sans pression.</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Mode actuel : <strong style={{ color: C.purple }}>{mode}</strong></div>

      <Card style={{ background: C.purplePale, border: "none", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: C.text }}>{done}/{quests.length} quêtes</div>
            <div style={{ fontSize: 12, color: C.muted }}>Pas de punition si tu n'en fais pas</div>
          </div>
          <div style={{ fontSize: 28 }}>🪙</div>
        </div>
        <div style={{ marginTop: 10, background: C.border, borderRadius: 10, height: 8 }}>
          <div style={{ width: `${(done / quests.length) * 100}%`, background: C.purple, height: 8, borderRadius: 10, transition: "width 0.4s" }} />
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {quests.map(q => (
          <Card key={q.id} onClick={() => {
            if (!q.done) {
              setQuests(prev => prev.map(x => x.id === q.id ? { ...x, done: true } : x));
              addCoins(q.coins);
            }
          }} style={{ display: "flex", alignItems: "center", gap: 14, opacity: q.done ? 0.6 : 1, background: q.done ? C.greenPale : C.bgCard }}>
            <span style={{ fontSize: 26 }}>{q.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 14, textDecoration: q.done ? "line-through" : "none" }}>{q.label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>+{q.coins} PsychoCoins</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: q.done ? C.green : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              {q.done ? "✓" : ""}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 20, background: "#FFF8E1", border: `1px solid ${C.yellow}88` }}>
        <p style={{ margin: 0, fontSize: 13, color: "#795548" }}>
          💛 Si tu ne te connectes pas pendant plusieurs jours, tes quêtes t'attendent sans te juger. Tu pars, tu reviens, c'est tout.
        </p>
      </Card>
    </div>
  );
}

function GameScreen({ onBack, setScreen }) {
  const games = [
    { icon: "🌬️", title: "Respiration guidée", desc: "Technique 4-4-6 pour calmer l'anxiété", s: S.BREATHE, color: C.purple, ready: true },
    { icon: "🌿", title: "Scan corporel", desc: "Reconnecte-toi à ton corps", s: S.SCAN, color: C.green, ready: true },
    { icon: "📓", title: "Journal des émotions", desc: "Pose tes pensées, observe tes humeurs", s: S.JOURNAL, color: C.orange, ready: true },
    { icon: "🌟", title: "Gratitude du jour", desc: "3 choses positives d'aujourd'hui", s: S.GRATITUDE, color: C.yellow, ready: true },
    { icon: "🧩", title: "Défis cognitifs doux", desc: "Stimule ton esprit en douceur", s: S.COGNITIF, color: C.pink, ready: true },
  ];
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Activités 🎮</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Conçus avec des professionnels de santé mentale</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {games.map(g => (
          <Card key={g.title} onClick={() => g.ready && g.s && setScreen(g.s)} style={{ display: "flex", alignItems: "center", gap: 14, opacity: g.ready ? 1 : 0.65 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${g.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {g.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.text }}>{g.title}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{g.desc}</div>
            </div>
            {g.ready ? <span style={{ color: C.purple, fontSize: 18 }}>→</span> : <Tag label="Bientôt" color={C.muted} bg={C.border} />}
          </Card>
        ))}
      </div>
    </div>
  );
}

function BreatheScreen({ onBack }) {
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const phases = [
    { name: "inhale", label: "Inspire…", duration: 4, color: C.purple, size: 160 },
    { name: "hold", label: "Retiens…", duration: 4, color: C.green, size: 130 },
    { name: "exhale", label: "Expire…", duration: 6, color: C.pink, size: 90 },
  ];
  const start = () => {
    setRunning(true);
    let pi = 0, cd = phases[0].duration;
    setPhase(phases[0].name); setCount(cd);
    const iv = setInterval(() => {
      cd--;
      if (cd <= 0) { pi = (pi + 1) % phases.length; cd = phases[pi].duration; setPhase(phases[pi].name); }
      setCount(cd);
    }, 1000);
    setTimeout(() => { clearInterval(iv); setRunning(false); setPhase("idle"); setCount(0); }, 60000);
  };
  const cur = phases.find(p => p.name === phase) || phases[0];
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Respiration 4-4-6 🌬️</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 32 }}>Calme le système nerveux en 1 minute</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: running ? cur.size : 120, height: running ? cur.size : 120, borderRadius: "50%", background: running ? cur.color : C.border, transition: "all 1s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: running ? `0 0 50px ${cur.color}55` : "none" }}>
          <span style={{ color: "#fff", fontSize: 36, fontWeight: 800 }}>{running ? count : "🌸"}</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginTop: 24, minHeight: 36 }}>
          {running ? cur.label : "Prêt·e ?"}
        </div>
        {!running && <Btn onClick={start} style={{ marginTop: 20 }}>Commencer</Btn>}
      </div>
      <Card style={{ marginTop: 40, background: C.purplePale, border: "none" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          💡 La respiration 4-4-6 active le système parasympathique. Pratiquée régulièrement, elle réduit l'anxiété et améliore le sommeil.
        </p>
      </Card>
    </div>
  );
}


// ─── Scan corporel ───────────────────────────────────────────
function ScanScreen({ onBack, addCoins }) {
  const steps = [
    { zone: "Pieds", emoji: "🦶", instruction: "Sens le contact de tes pieds avec le sol. Sont-ils chauds, froids, lourds ?" },
    { zone: "Jambes", emoji: "🦵", instruction: "Remarque tes jambes. Y a-t-il des tensions, des picotements ?" },
    { zone: "Ventre", emoji: "🫁", instruction: "Pose ta main sur ton ventre. Sens-tu ta respiration ?" },
    { zone: "Poitrine", emoji: "❤️", instruction: "Écoute ton cœur. Bat-il vite ou lentement ?" },
    { zone: "Épaules", emoji: "💪", instruction: "Tes épaules sont-elles crispées ? Essaie de les relâcher." },
    { zone: "Visage", emoji: "😌", instruction: "Détends ta mâchoire, ton front, tes yeux. Laisse tout se relâcher." },
  ];
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else { setDone(true); addCoins(15); }
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Scan corporel 🌿</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Reconnecte-toi à ton corps, étape par étape</div>

      {!started && !done && (
        <>
          <Card style={{ background: C.greenPale, border: "none", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
              🌿 Le scan corporel t'aide à quitter ta tête et revenir dans ton corps. Installe-toi confortablement, assis ou allongé.
            </p>
          </Card>
          <Btn onClick={() => setStarted(true)} color={C.green} style={{ width: "100%" }}>
            Commencer le scan
          </Btn>
        </>
      )}

      {started && !done && (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", margin: "0 4px",
                background: i <= step ? C.green : C.border, transition: "background 0.3s" }} />
            ))}
          </div>

          <Card style={{ background: `linear-gradient(135deg, ${C.greenPale}, ${C.purplePale})`, border: "none", textAlign: "center", padding: 32, marginBottom: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{steps[step].emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 12 }}>{steps[step].zone}</div>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, margin: 0 }}>{steps[step].instruction}</p>
          </Card>

          <div style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 16 }}>
            Étape {step + 1} / {steps.length}
          </div>

          <Btn onClick={next} color={C.green} style={{ width: "100%" }}>
            {step < steps.length - 1 ? "Étape suivante →" : "Terminer ✓"}
          </Btn>
        </>
      )}

      {done && (
        <>
          <Card style={{ background: C.greenPale, border: "none", textAlign: "center", padding: 32, marginBottom: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>✨</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Bravo !</div>
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Tu viens de traverser ton corps avec bienveillance. +15 PsychoCoins gagnés 🪙</p>
          </Card>
          <Btn onClick={onBack} color={C.green} style={{ width: "100%" }}>Retour aux activités</Btn>
        </>
      )}
    </div>
  );
}

// ─── Journal des émotions ─────────────────────────────────────
function JournalScreen({ onBack, addCoins }) {
  const EMOTIONS = [
    { emoji: "😊", label: "Joyeux·se" }, { emoji: "😔", label: "Triste" },
    { emoji: "😰", label: "Anxieux·se" }, { emoji: "😡", label: "En colère" },
    { emoji: "😴", label: "Fatigué·e" }, { emoji: "😌", label: "Calme" },
    { emoji: "🥰", label: "Aimé·e" }, { emoji: "😕", label: "Confus·e" },
    { emoji: "😤", label: "Frustré·e" }, { emoji: "🤗", label: "Reconnaissant·e" },
  ];
  const [emotion, setEmotion] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!emotion) return;
    setSaved(true);
    addCoins(10);
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Journal des émotions 📓</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Pose tes pensées, observe tes humeurs</div>

      {!saved ? (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>Comment tu te sens là, maintenant ?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EMOTIONS.map(e => (
                <button key={e.label} onClick={() => setEmotion(e)}
                  style={{ padding: "8px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: emotion?.label === e.label ? C.orange : C.bg,
                    color: emotion?.label === e.label ? "#fff" : C.text,
                    fontWeight: emotion?.label === e.label ? 700 : 400,
                    fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </Card>

          {emotion && (
            <>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>
                  Intensité : {["","😶","🙂","😐","😟","😣"][intensity]}
                </div>
                <input type="range" min="1" max="5" value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.orange }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginTop: 4 }}>
                  <span>Légère</span><span>Intense</span>
                </div>
              </Card>

              <Card style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Tu veux en dire plus ? (optionnel)
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="Ce qui se passe en moi en ce moment..."
                  style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 12,
                    border: `1px solid ${C.border}`, outline: "none", fontSize: 14,
                    background: C.bg, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </Card>

              <Btn onClick={save} color={C.orange} style={{ width: "100%" }}>
                💾 Enregistrer dans mon journal
              </Btn>
            </>
          )}
        </>
      ) : (
        <Card style={{ background: C.orangePale, border: "none", textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{emotion?.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Noté !</div>
          <p style={{ fontSize: 14, color: C.muted, margin: "0 0 20px" }}>
            Mettre des mots sur ses émotions, c'est déjà prendre soin de soi. +10 PsychoCoins 🪙
          </p>
          <Btn onClick={onBack} color={C.orange} style={{ width: "100%" }}>Retour aux activités</Btn>
        </Card>
      )}
    </div>
  );
}

// ─── Gratitude du jour ────────────────────────────────────────
function GratitudeScreen({ onBack, addCoins }) {
  const SUGGESTIONS = [
    "Un moment agréable aujourd'hui", "Quelqu'un qui compte pour toi",
    "Quelque chose de beau que tu as vu", "Une chose que ton corps a faite pour toi",
    "Un petit plaisir simple", "Une force que tu as en toi",
  ];
  const [items, setItems] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);

  const update = (i, val) => setItems(prev => prev.map((x, idx) => idx === i ? val : x));
  const canSave = items.filter(x => x.trim()).length >= 1;

  const save = () => {
    setSaved(true);
    addCoins(10);
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Gratitude du jour 🌟</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>3 petites choses positives d'aujourd'hui</div>

      {!saved ? (
        <>
          <Card style={{ background: C.yellowPale, border: "none", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
              ✨ La gratitude ne demande pas que tout aille bien. Même un tout petit moment compte.
            </p>
          </Card>

          {items.map((item, i) => (
            <Card key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>
                {["🌟", "💛", "✨"][i]} Chose {i + 1}
              </div>
              <input value={item} onChange={e => update(i, e.target.value)}
                placeholder={SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: `1px solid ${C.border}`, outline: "none", fontSize: 14,
                  background: C.bg, fontFamily: "inherit", boxSizing: "border-box" }} />
            </Card>
          ))}

          <Btn onClick={save} color={C.yellow} style={{ width: "100%", marginTop: 8, color: C.text }}
            disabled={!canSave}>
            🌟 Sauvegarder ma gratitude
          </Btn>
        </>
      ) : (
        <Card style={{ background: C.yellowPale, border: "none", textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🌟</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Magnifique !</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>
            {items.filter(x => x.trim()).map((x, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: i < items.filter(x=>x.trim()).length-1 ? `1px solid ${C.border}` : "none" }}>
                {["🌟","💛","✨"][i]} {x}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>+10 PsychoCoins gagnés 🪙</p>
          <Btn onClick={onBack} color={C.yellow} style={{ width: "100%", color: C.text }}>Retour aux activités</Btn>
        </Card>
      )}
    </div>
  );
}

// ─── Défis cognitifs doux ─────────────────────────────────────
function CognitifScreen({ onBack, addCoins }) {
  const DEFIS = [
    {
      id: 1, title: "5-4-3-2-1", emoji: "👁️",
      desc: "Un exercice d'ancrage pour revenir au présent",
      steps: [
        { n: 5, sense: "👁️", label: "choses que tu VOIS autour de toi" },
        { n: 4, sense: "🤚", label: "choses que tu peux TOUCHER" },
        { n: 3, sense: "👂", label: "choses que tu ENTENDS" },
        { n: 2, sense: "👃", label: "choses que tu SENS (odeurs)" },
        { n: 1, sense: "👅", label: "chose que tu GOÛTES" },
      ]
    },
    {
      id: 2, title: "Pensée alternative", emoji: "💭",
      desc: "Reformule une pensée négative",
      prompts: [
        "Je ne suis bon·ne à rien",
        "Tout va mal",
        "Les autres me jugent",
        "Je n'y arriverai jamais",
      ]
    },
    {
      id: 3, title: "Ma météo intérieure", emoji: "🌤️",
      desc: "Décris ton état en image météo",
      meteos: ["⛈️ Orage", "🌧️ Pluie", "☁️ Nuageux", "🌤️ Éclaircie", "☀️ Soleil", "🌈 Arc-en-ciel"]
    },
  ];

  const [selected, setSelected] = useState(null);
  const [senseStep, setSenseStep] = useState(0);
  const [senseInputs, setSenseInputs] = useState([[], [], [], [], []]);
  const [currentInput, setCurrentInput] = useState("");
  const [pensee, setPensee] = useState("");
  const [alternative, setAlternative] = useState("");
  const [meteo, setMeteo] = useState(null);
  const [done, setDone] = useState(false);

  const addSenseItem = () => {
    if (!currentInput.trim()) return;
    const step = DEFIS[0].steps[senseStep];
    setSenseInputs(prev => {
      const next = [...prev];
      next[senseStep] = [...next[senseStep], currentInput.trim()];
      return next;
    });
    setCurrentInput("");
    if (senseInputs[senseStep].length + 1 >= step.n) {
      if (senseStep < 4) setSenseStep(s => s + 1);
      else { setDone(true); addCoins(15); }
    }
  };

  if (done) return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <Card style={{ background: C.pinkPale, border: "none", textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🧠</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Excellent !</div>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Tu as ancré ton esprit dans le présent. +15 PsychoCoins 🪙</p>
        <Btn onClick={onBack} color={C.pink} style={{ width: "100%" }}>Retour aux activités</Btn>
      </Card>
    </div>
  );

  if (!selected) return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Défis cognitifs 🧩</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Des exercices doux pour l'esprit</div>
      {DEFIS.map(d => (
        <Card key={d.id} onClick={() => setSelected(d)} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: C.pinkPale,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            {d.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.text }}>{d.title}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{d.desc}</div>
          </div>
          <span style={{ color: C.purple }}>→</span>
        </Card>
      ))}
    </div>
  );

  // Exercice 1 : 5-4-3-2-1
  if (selected.id === 1) {
    const step = selected.steps[senseStep];
    return (
      <div style={{ padding: "20px 16px" }}>
        <BackBtn onBack={() => setSelected(null)} />
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>5-4-3-2-1 👁️</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Ancrage dans le moment présent</div>
        <Card style={{ background: C.pinkPale, border: "none", textAlign: "center", padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 48 }}>{step.sense}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 8 }}>
            Nomme {step.n - senseInputs[senseStep].length} {step.label}
          </div>
        </Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {senseInputs[senseStep].map((item, i) => (
            <span key={i} style={{ background: C.pink, color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{item}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={currentInput} onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSenseItem()}
            placeholder="Tape et appuie sur Entrée..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
              outline: "none", fontSize: 14, background: C.bg }} />
          <Btn onClick={addSenseItem} color={C.pink} style={{ padding: "10px 18px", margin: 0, borderRadius: 12 }}>+</Btn>
        </div>
      </div>
    );
  }

  // Exercice 2 : Pensée alternative
  if (selected.id === 2) {
    const prompt = selected.prompts[Math.floor(Math.random() * selected.prompts.length)];
    return (
      <div style={{ padding: "20px 16px" }}>
        <BackBtn onBack={() => setSelected(null)} />
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Pensée alternative 💭</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Reformule une pensée difficile</div>
        <Card style={{ background: "#FEE2E2", border: "none", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Pensée automatique :</div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 16 }}>"{pensee || prompt}"</div>
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Et si tu la reformulais autrement ?</div>
          <textarea value={alternative} onChange={e => setAlternative(e.target.value)}
            placeholder="Une version plus douce, plus nuancée, plus vraie..."
            style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 12,
              border: `1px solid ${C.border}`, outline: "none", fontSize: 14,
              background: C.bg, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </Card>
        {alternative.length > 5 && (
          <Btn onClick={() => { setDone(true); addCoins(15); }} color={C.pink} style={{ width: "100%" }}>
            ✓ Valider ma pensée alternative
          </Btn>
        )}
      </div>
    );
  }

  // Exercice 3 : Météo intérieure
  if (selected.id === 3) {
    return (
      <div style={{ padding: "20px 16px" }}>
        <BackBtn onBack={() => setSelected(null)} />
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Ma météo intérieure 🌤️</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Quel temps fait-il en toi aujourd'hui ?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {selected.meteos.map(m => (
            <Card key={m} onClick={() => setMeteo(m)} style={{
              textAlign: "center", padding: 20, cursor: "pointer",
              border: meteo === m ? `2px solid ${C.pink}` : `1px solid ${C.border}`,
              background: meteo === m ? C.pinkPale : C.bgCard,
            }}>
              <div style={{ fontSize: 36 }}>{m.split(" ")[0]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{m.split(" ").slice(1).join(" ")}</div>
            </Card>
          ))}
        </div>
        {meteo && (
          <Btn onClick={() => { setDone(true); addCoins(15); }} color={C.pink} style={{ width: "100%" }}>
            ✓ C'est ma météo du jour
          </Btn>
        )}
      </div>
    );
  }

  return null;
}


// ─── Communauté ───────────────────────────────────────────────
const COMMUNITY_POSTS = [
  { id: 1, user: "Léa", emoji: "🌸", time: "il y a 2h", text: "Aujourd'hui j'ai réussi à sortir faire une courte promenade. C'est tout petit mais pour moi c'est énorme. 💪", likes: 24, comments: 8, liked: false },
  { id: 2, user: "Thomas", emoji: "🌊", time: "il y a 4h", text: "Nuit difficile. Je me sens épuisé mais je suis là, et c'est déjà ça. Merci à ceux qui comprennent sans juger.", likes: 41, comments: 15, liked: false },
  { id: 3, user: "Maya", emoji: "🌻", time: "il y a 6h", text: "3 mois que je fais la respiration guidée chaque matin. Je ne guéris pas vite, mais je tiens. Vous aussi vous tenez. 🌬️", likes: 67, comments: 22, liked: false },
  { id: 4, user: "Nico", emoji: "⭐", time: "hier", text: "Question : est-ce que quelqu'un a des conseils pour parler de son anxiété à sa famille ? C'est tellement dur de trouver les mots.", likes: 19, comments: 31, liked: false },
  { id: 5, user: "Sonia", emoji: "🎵", time: "hier", text: "La musique m'a sauvée aujourd'hui. Un morceau, les yeux fermés, 5 minutes. Parfois c'est tout ce qu'il faut.", likes: 38, comments: 7, liked: false },
];

function CommunauteScreen({ onBack }) {
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [newPost, setNewPost] = useState("");
  const [showWrite, setShowWrite] = useState(false);
  const [tab, setTab] = useState("fil");

  const toggleLike = (id) => {
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  };

  const publish = () => {
    if (!newPost.trim()) return;
    setPosts(prev => [{
      id: Date.now(), user: "Moi", emoji: "🌸", time: "à l'instant",
      text: newPost, likes: 0, comments: 0, liked: false
    }, ...prev]);
    setNewPost("");
    setShowWrite(false);
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Communauté 👥</div>
        <button onClick={() => setShowWrite(!showWrite)} style={{
          background: C.purple, color: "#fff", border: "none", borderRadius: 20,
          padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer"
        }}>✏️ Écrire</button>
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Un espace bienveillant et sécurisé</div>

      <Card style={{ background: "#FFF8E1", border: `1px solid ${C.yellow}88`, marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#795548" }}>
          🤝 Cet espace est anonyme et modéré. Pas de jugement, pas de conseils non demandés. Juste de la présence.
        </p>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{id:"fil",label:"📰 Fil"},{id:"groupes",label:"👥 Groupes"},{id:"amis",label:"💜 Amis"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "7px 14px", borderRadius: 20, border: "none", fontSize: 12,
            fontWeight: 700, cursor: "pointer",
            background: tab === t.id ? C.purple : C.border,
            color: tab === t.id ? "#fff" : C.muted,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Write zone */}
      {showWrite && (
        <Card style={{ marginBottom: 16, background: C.purplePale, border: "none" }}>
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
            placeholder="Partage ce que tu vis, anonymement et sans jugement..."
            style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 12,
              border: `1px solid ${C.border}`, outline: "none", fontSize: 14,
              background: "#fff", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <Btn onClick={publish} color={C.purple} small>Publier 💜</Btn>
          </div>
        </Card>
      )}

      {tab === "fil" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map(p => (
            <Card key={p.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.purplePale,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {p.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.user}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.time}</div>
                </div>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: C.text, lineHeight: 1.7 }}>{p.text}</p>
              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={() => toggleLike(p.id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: p.liked ? C.pink : C.muted, fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4
                }}>
                  {p.liked ? "💜" : "🤍"} {p.likes}
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer",
                  color: C.muted, fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4 }}>
                  💬 {p.comments}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "groupes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { emoji: "😔", name: "Dépression", members: 1243, desc: "Soutien mutuel pour ceux qui traversent une dépression" },
            { emoji: "😰", name: "Anxiété", members: 2891, desc: "Partage et conseils pour gérer l'anxiété au quotidien" },
            { emoji: "🌊", name: "Trouble bipolaire", members: 567, desc: "Espace d'échange pour les personnes bipolaires et leurs proches" },
            { emoji: "🤝", name: "Proches aidants", members: 891, desc: "Pour ceux qui accompagnent un proche en souffrance" },
            { emoji: "🌱", name: "Rétablissement", members: 432, desc: "Célébrer les petites victoires ensemble" },
          ].map((g, i) => (
            <Card key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: C.purplePale,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                {g.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.text }}>{g.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{g.members.toLocaleString()} membres</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{g.desc}</div>
              </div>
              <Btn small color={C.purple} style={{ padding: "6px 12px", flexShrink: 0 }}>Rejoindre</Btn>
            </Card>
          ))}
        </div>
      )}

      {tab === "amis" && (
        <Card style={{ textAlign: "center", padding: 40, background: C.purplePale, border: "none" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💜</div>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Tes connexions</div>
          <p style={{ fontSize: 14, color: C.muted, margin: "0 0 20px" }}>
            Connecte-toi avec des personnes qui comprennent ce que tu traverses.
          </p>
          <Btn color={C.purple} style={{ width: "100%" }}>Trouver des connexions</Btn>
        </Card>
      )}
    </div>
  );
}

// ─── Suivi d'humeur ───────────────────────────────────────────
const HUMEUR_DATA = [
  { jour: "Lun", score: 3, emoji: "😐" },
  { jour: "Mar", score: 4, emoji: "🙂" },
  { jour: "Mer", score: 2, emoji: "😔" },
  { jour: "Jeu", score: 4, emoji: "🙂" },
  { jour: "Ven", score: 5, emoji: "😊" },
  { jour: "Sam", score: 3, emoji: "😐" },
  { jour: "Dim", score: null, emoji: "?" },
];

function SuiviHumeurScreen({ onBack }) {
  const [data, setData] = useState(HUMEUR_DATA);
  const [selected, setSelected] = useState(null);
  const [periode, setPeriode] = useState("semaine");

  const HUMEURS = [
    { score: 1, emoji: "😣", label: "Très mal" },
    { score: 2, emoji: "😔", label: "Pas bien" },
    { score: 3, emoji: "😐", label: "Neutre" },
    { score: 4, emoji: "🙂", label: "Bien" },
    { score: 5, emoji: "😊", label: "Très bien" },
  ];

  const logToday = (score) => {
    setData(prev => prev.map((d, i) => i === prev.length - 1 ? { ...d, score, emoji: HUMEURS[score-1].emoji } : d));
    setSelected(score);
  };

  const maxScore = 5;
  const hasToday = data[data.length - 1].score !== null;

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Suivi d'humeur 📊</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Observe tes émotions dans le temps</div>

      {/* Today's log */}
      {!hasToday && (
        <Card style={{ marginBottom: 20, background: C.purplePale, border: "none" }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>Comment tu vas aujourd'hui ?</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {HUMEURS.map(h => (
              <button key={h.score} onClick={() => logToday(h.score)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                background: selected === h.score ? C.purple : "transparent",
                border: "none", borderRadius: 12, padding: "8px 4px", cursor: "pointer",
                flex: 1,
              }}>
                <span style={{ fontSize: 28 }}>{h.emoji}</span>
                <span style={{ fontSize: 10, color: selected === h.score ? "#fff" : C.muted, fontWeight: 600 }}>
                  {h.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {hasToday && (
        <Card style={{ marginBottom: 20, background: C.greenPale, border: "none", textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 32 }}>{data[data.length-1].emoji}</div>
          <div style={{ fontWeight: 700, color: C.text, marginTop: 4 }}>Humeur du jour enregistrée ✓</div>
        </Card>
      )}

      {/* Période */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["semaine", "mois"].map(p => (
          <button key={p} onClick={() => setPeriode(p)} style={{
            padding: "7px 16px", borderRadius: 20, border: "none", fontWeight: 700,
            fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            background: periode === p ? C.purple : C.border,
            color: periode === p ? "#fff" : C.muted,
          }}>{p === "semaine" ? "Cette semaine" : "Ce mois"}</button>
        ))}
      </div>

      {/* Graph */}
      <Card style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 120, marginBottom: 8 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              {d.score !== null ? (
                <div style={{
                  width: "70%", borderRadius: "6px 6px 0 0",
                  height: `${(d.score / maxScore) * 100}px`,
                  background: d.score >= 4 ? C.green : d.score === 3 ? C.yellow : C.pink,
                  transition: "height 0.5s ease",
                  display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 4
                }}>
                  <span style={{ fontSize: 12 }}>{d.emoji}</span>
                </div>
              ) : (
                <div style={{ width: "70%", height: 20, borderRadius: 6,
                  background: C.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: C.muted }}>?</span>
                </div>
              )}
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{d.jour}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Moyenne", val: (data.filter(d=>d.score).reduce((a,b)=>a+b.score,0)/data.filter(d=>d.score).length).toFixed(1), emoji: "📊" },
          { label: "Meilleur", val: Math.max(...data.filter(d=>d.score).map(d=>d.score)), emoji: "⬆️" },
          { label: "Jours notés", val: data.filter(d=>d.score).length + "/7", emoji: "📅" },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 20 }}>{s.emoji}</div>
            <div style={{ fontWeight: 800, color: C.purple, fontSize: 18 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ background: C.purplePale, border: "none" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          💡 Le suivi d'humeur t'aide à repérer des patterns. Tu peux partager ce graphique avec ton soignant si tu le souhaites.
        </p>
      </Card>
    </div>
  );
}

// ─── Carte des urgences ───────────────────────────────────────
const URGENCES_DATA = [
  { nom: "3114 — Numéro national prévention suicide", type: "Urgence nationale", tel: "3114", ouvert: "24h/24 · Gratuit · Confidentiel", color: "#E05A5A", bg: "#FEE2E2", emoji: "🆘" },
  { nom: "SAMU", type: "Urgence médicale", tel: "15", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "🚑" },
  { nom: "CHU Pitié-Salpêtrière — Urgences Psy", type: "Hôpital", tel: "01 42 16 00 00", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "🏥", ville: "Paris 13e" },
  { nom: "CMP Paris 11e", type: "Centre médico-psychologique", tel: "01 43 67 12 34", ouvert: "Lun-Ven 9h-17h", color: C.green, bg: C.greenPale, emoji: "🏡", ville: "Paris 11e" },
  { nom: "Clinique des Lilas", type: "Clinique psychiatrique", tel: "01 49 72 72 00", ouvert: "24h/24", color: C.orange, bg: C.orangePale, emoji: "🏥", ville: "Les Lilas (93)" },
  { nom: "SOS Amitié", type: "Écoute téléphonique", tel: "09 72 39 40 50", ouvert: "24h/24", color: C.pink, bg: C.pinkPale, emoji: "💬" },
  { nom: "Fil Santé Jeunes", type: "Écoute 12-25 ans", tel: "0800 235 236", ouvert: "8h-minuit · Gratuit", color: C.green, bg: C.greenPale, emoji: "🌱" },
];

function UrgencesScreen({ onBack }) {
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");

  const filtres = ["tous", "urgence", "hôpital", "écoute"];

  const filtered = URGENCES_DATA.filter(u => {
    const matchSearch = u.nom.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === "tous" ||
      (filtre === "urgence" && u.type.toLowerCase().includes("urgence")) ||
      (filtre === "hôpital" && (u.type.toLowerCase().includes("hôpital") || u.type.toLowerCase().includes("clinique"))) ||
      (filtre === "écoute" && u.type.toLowerCase().includes("écoute"));
    return matchSearch && matchFiltre;
  });

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Urgences 🏥</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Contacts et structures disponibles</div>

      {/* 3114 en évidence */}
      <Card style={{ background: "#FEE2E2", border: "2px solid #E05A5A", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 36 }}>🆘</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: "#E05A5A", fontSize: 18 }}>3114</div>
            <div style={{ fontSize: 14, color: C.text }}>Numéro national prévention suicide</div>
            <div style={{ fontSize: 12, color: C.muted }}>Gratuit · 24h/24 · 7j/7 · Confidentiel</div>
          </div>
          <a href="tel:3114" style={{ textDecoration: "none" }}>
            <Btn color="#E05A5A" small>📞 Appeler</Btn>
          </a>
        </div>
      </Card>

      {/* Recherche */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Rechercher..."
        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
          outline: "none", fontSize: 14, background: C.bg, marginBottom: 12, boxSizing: "border-box" }} />

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filtres.map(f => (
          <button key={f} onClick={() => setFiltre(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700,
            fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            background: filtre === f ? C.purple : C.border,
            color: filtre === f ? "#fff" : C.muted,
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((u, i) => (
          <Card key={i} style={{ background: u.bg, border: `1px solid ${u.color}33` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{u.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{u.nom}</div>
                <div style={{ fontSize: 12, color: u.color, fontWeight: 600, marginTop: 2 }}>{u.type}</div>
                {u.ville && <div style={{ fontSize: 12, color: C.muted }}>📍 {u.ville}</div>}
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>⏰ {u.ouvert}</div>
              </div>
              <a href={"tel:" + u.tel} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ background: u.color, color: "#fff", borderRadius: 12,
                  padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
                  📞 {u.tel}
                </div>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Rappels ─────────────────────────────────────────────────
function RappelsScreen({ onBack }) {
  const [rappels, setRappels] = useState([
    { id: 1, label: "Quête du matin", heure: "09:00", actif: true, emoji: "🌅" },
    { id: 2, label: "Exercice de respiration", heure: "12:30", actif: false, emoji: "🌬️" },
    { id: 3, label: "Journal des émotions", heure: "20:00", actif: true, emoji: "📓" },
    { id: 4, label: "Gratitude du soir", heure: "21:30", actif: false, emoji: "🌟" },
  ]);

  const toggle = (id) => setRappels(prev => prev.map(r => r.id === id ? { ...r, actif: !r.actif } : r));

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Rappels 🔔</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Des rappels doux, sans pression</div>

      <Card style={{ background: C.purplePale, border: "none", marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
          💜 Les rappels sont là pour toi, pas contre toi. Tu peux les ignorer sans te sentir coupable.
        </p>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {rappels.map(r => (
          <Card key={r.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.text }}>{r.label}</div>
              <div style={{ fontSize: 13, color: C.muted }}>🕐 {r.heure}</div>
            </div>
            <button onClick={() => toggle(r.id)} style={{
              width: 50, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
              background: r.actif ? C.purple : C.border,
              transition: "background 0.2s", position: "relative",
              display: "flex", alignItems: "center", padding: "0 3px",
              justifyContent: r.actif ? "flex-end" : "flex-start",
            }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "all 0.2s" }} />
            </button>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>➕ Ajouter un rappel</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Ex : Méditation du soir"
            style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
              outline: "none", fontSize: 14, background: C.bg }} />
          <input type="time" defaultValue="08:00"
            style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
              outline: "none", fontSize: 14, background: C.bg }} />
          <Btn color={C.purple} style={{ width: "100%" }}>Ajouter</Btn>
        </div>
      </Card>

      <Card style={{ background: "#FFF8E1", border: `1px solid ${C.yellow}88` }}>
        <p style={{ margin: 0, fontSize: 13, color: "#795548" }}>
          ℹ️ Les rappels nécessitent d'activer les notifications dans les paramètres de ton téléphone.
        </p>
      </Card>
    </div>
  );
}

function ChatScreen({ onBack, setScreen, setChatContact }) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Parler à quelqu'un 💬</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Soignants, pair-aidants, bénévoles</div>
      <Card style={{ background: "#FFF8E1", border: `1px solid ${C.yellow}88`, marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#795548" }}>
          ⚠️ Ce service ne remplace pas une consultation médicale. En cas de crise : <strong>3114</strong> (gratuit, 24h/24).
        </p>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CONTACTS.map(c => (
          <Card key={c.id} onClick={() => { if(c.available){ setChatContact(c); setScreen(S.CHAT_ROOM); } }} style={{ display: "flex", alignItems: "center", gap: 14, opacity: c.available ? 1 : 0.5, cursor: c.available ? "pointer" : "default" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
              {c.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, color: C.text }}>{c.name}</span>
                {c.expert && <Tag label="Pair-aidant·e" color={C.green} bg={C.greenPale} />}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>{c.role}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{c.specialty}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.available ? C.green : "#ccc" }} />
              <span style={{ fontSize: 10, color: c.available ? C.green : C.muted }}>{c.available ? "Dispo" : "Absent"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChatRoomScreen({ onBack, contact, user }) {
  const welcomeMsg = {
    id: "welcome",
    from: "them",
    text: "Bonjour, je suis " + contact.name + ". Comment puis-je vous aider aujourd'hui ?",
    time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
  };
  const [msgs, setMsgs] = useState([welcomeMsg]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const wsRef = useRef(null);

  // Charger les messages existants + connexion temps réel
  useEffect(() => {
    let ws = null;

    const loadMessages = async () => {
      if (!user?.token) return;
      try {
        const data = await supabase.getMessages(contact.id || contact.name, user.token);
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(m => ({
            id: m.id,
            from: m.sender_id === user.id ? "me" : "them",
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
          }));
          setMsgs([welcomeMsg, ...formatted]);
        }
      } catch(e) { console.log("Could not load messages"); }
    };

    const connectRealtime = () => {
      try {
        ws = new WebSocket(
          "wss://umhfmhvzttifqdenriwq.supabase.co/realtime/v1/websocket?apikey=sb_publishable_p5H4tjNv8q0Wta_OuRugwA_CE8NLcev&vsn=1.0.0"
        );

        ws.onopen = () => {
          setConnected(true);
          ws.send(JSON.stringify({
            topic: "realtime:public:messages",
            event: "phx_join",
            payload: { config: { broadcast: { self: false }, presence: { key: "" } } },
            ref: "1"
          }));
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.event === "INSERT" && data.payload?.record) {
              const record = data.payload.record;
              if (record.sender_id !== user?.id) {
                setMsgs(m => [...m, {
                  id: record.id,
                  from: "them",
                  text: record.content,
                  time: new Date(record.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
                }]);
              }
            }
          } catch(err) {}
        };

        ws.onclose = () => {
          setConnected(false);
          // Reconnect after 3s
          setTimeout(connectRealtime, 3000);
        };

        ws.onerror = () => { setConnected(false); };
        wsRef.current = ws;
      } catch(e) { console.log("WebSocket error", e); }
    };

    loadMessages();
    connectRealtime();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const newMsg = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
    };
    setMsgs(m => [...m, newMsg]);

    try {
      if (user?.token) {
        await supabase.sendMessage({
          sender_id: user.id,
          receiver_id: contact.id || contact.name,
          content: text,
          created_at: new Date().toISOString()
        }, user.token);
      }
    } catch(e) { console.log("Send error", e); }

    setSending(false);

    // Réponse automatique si pas de vraie personne connectée
    if (!connected) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, {
          id: Date.now() + 1,
          from: "them",
          text: "Merci de partager ça avec moi. Je vous écoute. Pouvez-vous m'en dire un peu plus ?",
          time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
        }]);
      }, 2000);
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, background: C.bgCard }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.purple, fontWeight: 700, fontSize: 18, cursor: "pointer" }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: contact.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>{contact.name[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: C.text }}>{contact.name}</div>
          <div style={{ fontSize: 12, color: connected ? C.green : C.muted }}>
            {connected ? "🟢 Connecté en temps réel" : contact.role}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.from === "me" ? C.purple : C.bgCard, color: m.from === "me" ? "#fff" : C.text, fontSize: 14, border: m.from !== "me" ? `1px solid ${C.border}` : "none" }}>
              {m.text}
              {m.time && <div style={{fontSize:10, opacity:0.6, marginTop:4, textAlign:"right"}}>{m.time}</div>}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
              background: C.bgCard, border: `1px solid ${C.border}`,
              display: "flex", gap: 4, alignItems: "center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%",
                  background: C.muted, opacity: 0.5 + i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, background: C.bgCard }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Écrivez votre message…" style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, background: C.bg }} />
        <Btn onClick={send} color={sending ? C.muted : C.purple} style={{ padding: "10px 18px", borderRadius: 24, margin: 0 }}>
          {sending ? "..." : "↑"}
        </Btn>
      </div>
    </div>
  );
}

function LiveScreen({ onBack }) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Lives 🎙️</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Échanges en direct avec des professionnels et pair-aidants</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LIVES.map(l => (
          <Card key={l.id} style={{ borderLeft: `4px solid ${l.live ? C.urgent : C.purple}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: C.text }}>{l.title}</span>
                  {l.live && <Tag label="🔴 EN DIRECT" color={C.urgent} bg="#FEE2E2" />}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{l.who}</div>
                <div style={{ fontSize: 12, color: C.purple, fontWeight: 600, marginTop: 4 }}>{l.when}</div>
              </div>
            </div>
            {l.live && <Btn small color={C.urgent} style={{ marginTop: 10, width: "100%" }}>Rejoindre le live</Btn>}
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 16, background: C.purplePale, border: "none" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.text }}>
          📅 2 à 3 lives par semaine avec psychiatres, psychologues, associations et patients experts.
        </p>
      </Card>
    </div>
  );
}

function ResourcesScreen({ onBack, setScreen, setFiche }) {
  const [tab, setTab] = useState("fiches");
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Ressources 📚</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Informations validées par des professionnels</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["fiches", "médicaments", "urgences", "droits"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 14px", borderRadius: 20, border: "none", background: tab === t ? C.purple : C.border, color: tab === t ? "#fff" : C.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "fiches" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FICHES.map(f => (
            <Card key={f.id} onClick={() => { setFiche(f); setScreen(S.FICHE); }} style={{ background: f.color, border: `1px solid ${f.border}33`, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 32 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: C.text }}>{f.title}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{f.symptomes.slice(0, 2).join(" · ")}</div>
              </div>
              <span style={{ marginLeft: "auto", color: C.purple }}>→</span>
            </Card>
          ))}
        </div>
      )}

      {tab === "médicaments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MEDICAMENTS.map((m, i) => (
            <Card key={i}>
              <div style={{ fontWeight: 700, color: C.text }}>{m.nom}</div>
              <Tag label={m.famille} color={C.purple} bg={C.purplePale} />
              <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Indications : {m.indications}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Effets fréquents : {m.effets_freq.join(", ")}</div>
              <Card style={{ marginTop: 10, background: "#FFF8E1", border: "none", padding: 10 }}>
                <div style={{ fontSize: 12, color: "#795548" }}>⚠️ {m.precautions}</div>
              </Card>
            </Card>
          ))}
          <Card style={{ background: C.purplePale, border: "none" }}>
            <p style={{ margin: 0, fontSize: 13, color: C.text }}>💊 Ces fiches sont informatives. Ne modifiez jamais un traitement sans votre médecin.</p>
          </Card>
        </div>
      )}

      {tab === "urgences" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ background: "#FEE2E2", border: `1px solid ${C.urgent}44` }}>
            <div style={{ fontWeight: 800, color: C.urgent, fontSize: 18 }}>🆘 3114</div>
            <div style={{ color: C.text, fontSize: 14 }}>Numéro national de prévention du suicide</div>
            <div style={{ color: C.muted, fontSize: 13 }}>Gratuit · 24h/24 · 7j/7 · Confidentiel</div>
            <Btn color={C.urgent} small style={{ marginTop: 10 }}>Appeler maintenant</Btn>
          </Card>
          {URGENCES.map((u, i) => (
            <Card key={i}>
              <div style={{ fontWeight: 700, color: C.text }}>{u.nom}</div>
              <div style={{ fontSize: 13, color: C.muted }}>📍 {u.ville}</div>
              <div style={{ fontSize: 13, color: C.muted }}>📞 {u.tel}</div>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>⏰ {u.ouvert}</div>
            </Card>
          ))}
        </div>
      )}

      {tab === "droits" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "💰", title: "Remboursement psy", desc: "Depuis 2022, jusqu'à 12 séances remboursées par an sur prescription médicale." },
            { icon: "🏥", title: "Hospitalisation sous contrainte", desc: "Vous avez le droit d'être informé·e et de contacter un avocat." },
            { icon: "📋", title: "Directives anticipées psychiatriques", desc: "Vous pouvez exprimer vos souhaits de prise en charge à l'avance." },
            { icon: "🤝", title: "MDPH & handicap psychique", desc: "La maladie mentale peut ouvrir droit à des aides (AAH, RQTH)." },
            { icon: "🔒", title: "Confidentialité", desc: "Votre médecin est tenu au secret médical. Vos données de santé sont protégées." },
          ].map((d, i) => (
            <Card key={i} style={{ display: "flex", gap: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{d.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: C.text }}>{d.title}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>{d.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FicheScreen({ onBack, fiche }) {
  if (!fiche) return null;
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 40 }}>{fiche.icon}</span>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>{fiche.title}</div>
      </div>
      <Card style={{ background: fiche.color, border: `1px solid ${fiche.border}33`, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Symptômes fréquents</div>
        {fiche.symptomes.map((s, i) => <div key={i} style={{ fontSize: 14, color: C.text, padding: "4px 0", borderBottom: i < fiche.symptomes.length - 1 ? `1px solid ${fiche.border}33` : "none" }}>• {s}</div>)}
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Traitements possibles</div>
        {fiche.traitements.map((t, i) => <div key={i} style={{ fontSize: 14, color: C.text, padding: "4px 0" }}>✓ {t}</div>)}
      </Card>
      <Card style={{ background: C.purplePale, border: "none", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Ressources utiles</div>
        {fiche.ressources.map((r, i) => <div key={i} style={{ fontSize: 14, color: C.purple, padding: "4px 0" }}>→ {r}</div>)}
      </Card>
      <Card style={{ background: "#FFF8E1", border: `1px solid ${C.yellow}88` }}>
        <p style={{ margin: 0, fontSize: 13, color: "#795548" }}>
          ℹ️ Cette fiche est informative et validée par des professionnels. Elle ne remplace pas un diagnostic médical.
        </p>
      </Card>
    </div>
  );
}

function ProfileScreen({ onBack, coins, quests, mode, setMode, user, onLogout }) {
  const done = quests.filter(q => q.done).length;
  const modes = ["Mode libre", "Mode accompagné", "Mode engagement"];
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 20 }}>Mon profil</div>
      <Card style={{ textAlign: "center", padding: 24, marginBottom: 16, background: `linear-gradient(135deg, ${C.purplePale}, ${C.greenPale})`, border: "none" }}>
        <div style={{ fontSize: 64 }}>🌸</div>
        <div style={{ fontWeight: 800, color: C.text, marginTop: 8, fontSize: 18 }}>🪙 {coins} PsychoCoins</div>
        <div style={{ color: C.muted, fontSize: 13 }}>{done} quêtes complétées aujourd'hui</div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>Niveau d'implication</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>Ce choix t'appartient. Tu peux changer quand tu veux.</div>
        {modes.map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `2px solid ${mode === m ? C.purple : C.border}`, background: mode === m ? C.purplePale : C.bgCard, color: C.text, fontWeight: mode === m ? 700 : 400, fontSize: 14, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
            {mode === m ? "✓ " : ""}{m}
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>
              {m === "Mode libre" && "Aucune preuve demandée"}
              {m === "Mode accompagné" && "Rappels doux, plus de présence"}
              {m === "Mode engagement" && "Valide certaines quêtes par photo"}
            </div>
          </button>
        ))}
      </Card>

      <Card style={{ background: C.purplePale, border: "none" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          🔒 <strong>Tes données t'appartiennent.</strong> MentalBloom respecte le RGPD. Aucune donnée de santé n'est vendue ni partagée sans ton consentement.
        </p>
      </Card>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────

// ─── Système d'authentification ──────────────────────────────

function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🌸</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>MentalBloom</div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>Un espace pour toi, à ton rythme</div>
      <div style={{ marginTop: 48, display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%",
            background: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
            animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    </div>
  );
}

function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      emoji: "🌸",
      title: "Bienvenue sur MentalBloom",
      desc: "Un espace bienveillant pour prendre soin de ta santé mentale, à ton propre rythme.",
      bg: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
    },
    {
      emoji: "🎮",
      title: "Des activités pour aller mieux",
      desc: "Respiration, journal des émotions, gratitude... Des exercices conçus avec des professionnels.",
      bg: `linear-gradient(135deg, ${C.green}, #5AA882)`,
    },
    {
      emoji: "💬",
      title: "Tu n'es pas seul·e",
      desc: "Parle à des soignants, des pair-aidants, rejoins une communauté qui comprend ce que tu traverses.",
      bg: `linear-gradient(135deg, ${C.orange}, #E07D3F)`,
    },
    {
      emoji: "💜",
      title: "Aucun jugement, aucune pression",
      desc: "MentalBloom ne récompense pas la performance. Il valorise ta présence et tes petits pas.",
      bg: `linear-gradient(135deg, ${C.pink}, #D06090)`,
    },
  ];

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: slide.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between", padding: "60px 32px 48px",
      fontFamily: "'Inter', system-ui, sans-serif", transition: "background 0.5s" }}>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>{slide.emoji}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 16, lineHeight: 1.3 }}>{slide.title}</div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, maxWidth: 320 }}>{slide.desc}</div>
      </div>

      <div style={{ width: "100%" }}>
        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? "#fff" : "rgba(255,255,255,0.4)",
              transition: "all 0.3s" }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {!isLast && (
            <button onClick={onFinish} style={{ flex: 1, padding: 14, borderRadius: 50,
              background: "rgba(255,255,255,0.2)", color: "#fff", border: "none",
              fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Passer
            </button>
          )}
          <button onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
            style={{ flex: 2, padding: 14, borderRadius: 50,
              background: "#fff", color: C.purple, border: "none",
              fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            {isLast ? "Commencer 🌸" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Remplis tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await supabase.signIn(email.trim(), password);
      if (data.error) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }
      const user = {
        id: data.user.id,
        email: data.user.email,
        prenom: data.user.user_metadata?.prenom || "Utilisateur",
        profil: data.user.user_metadata?.profil || "souffrance",
        mode: data.user.user_metadata?.mode || "Mode libre",
        token: data.access_token,
        coins: 45,
      };
      setLoading(false);
      onLogin(user);
    } catch(e) {
      setError("Erreur de connexion. Vérifie ta connexion internet.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>

      <div style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
        padding: "48px 32px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Bon retour !</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>Connecte-toi à ton espace</div>
      </div>

      <div style={{ padding: "32px 24px", flex: 1 }}>
        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #E05A5A33", borderRadius: 12,
            padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#E05A5A", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 6 }}>
            Adresse email
          </label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="ton@email.com"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 14, fontSize: 15,
              border: `1px solid ${C.border}`, outline: "none", background: "#fff",
              boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 6 }}>
            Mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <input value={password} onChange={e => setPassword(e.target.value)}
              type={showPass ? "text" : "password"} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 14, fontSize: 15,
                border: `1px solid ${C.border}`, outline: "none", background: "#fff",
                boxSizing: "border-box", fontFamily: "inherit" }} />
            <button onClick={() => setShowPass(s => !s)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", padding: 14, borderRadius: 50, background: loading ? C.muted : C.purple,
            color: "#fff", border: "none", fontWeight: 800, fontSize: 16, cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : `0 4px 20px ${C.purple}44`, marginBottom: 16 }}>
          {loading ? "Connexion..." : "Se connecter 🌸"}
        </button>

        <div style={{ textAlign: "center", fontSize: 14, color: C.muted, marginBottom: 24 }}>
          Mot de passe oublié ?{" "}
          <span style={{ color: C.purple, fontWeight: 700, cursor: "pointer" }}>Réinitialiser</span>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 12 }}>Pas encore de compte ?</div>
          <button onClick={onGoRegister}
            style={{ width: "100%", padding: 14, borderRadius: 50, background: "transparent",
              color: C.purple, border: `2px solid ${C.purple}`, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({ onRegister, onGoLogin }) {
  const [step, setStep] = useState(1);
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [profil, setProfil] = useState(null);
  const [mode, setMode] = useState("Mode libre");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const PROFILS = [
    { id: "souffrance", emoji: "🌱", label: "Je vis avec des troubles mentaux", desc: "Je cherche du soutien et des ressources" },
    { id: "proche", emoji: "🤝", label: "Je suis proche/aidant·e", desc: "J'accompagne quelqu'un en souffrance" },
    { id: "curieux", emoji: "📚", label: "Je m'informe", desc: "Je veux mieux comprendre la santé mentale" },
  ];

  const MODES = [
    { id: "Mode libre", label: "Mode libre", desc: "Aucune preuve demandée, à ton rythme total" },
    { id: "Mode accompagné", label: "Mode accompagné", desc: "Rappels doux et plus de présence" },
    { id: "Mode engagement", label: "Mode engagement", desc: "Objectifs et validation de quêtes par photo" },
  ];

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!prenom.trim()) { setError("Entre ton prénom."); return; }
      if (!email.trim() || !email.includes("@")) { setError("Email invalide."); return; }
      if (password.length < 6) { setError("Mot de passe trop court (6 caractères min)."); return; }
      if (password !== confirmPass) { setError("Les mots de passe ne correspondent pas."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!profil) { setError("Choisis un profil."); return; }
      setStep(3);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const data = await supabase.signUp(email.trim(), password, { prenom, profil, mode });
      if (data.error) {
        setError(data.error.message === "User already registered"
          ? "Cet email est déjà utilisé."
          : "Erreur lors de la création du compte.");
        setLoading(false);
        return;
      }
      const user = {
        id: data.user?.id,
        email: email.toLowerCase(),
        prenom, profil, mode,
        token: data.session?.access_token,
        coins: 0,
      };
      setLoading(false);
      onRegister(user);
    } catch(e) {
      setError("Erreur de connexion. Vérifie ta connexion internet.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif",
      maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
        padding: "40px 24px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Étape {step}/3</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 4 }}>
          {step === 1 ? "Créer ton compte" : step === 2 ? "Ton profil" : "Ton mode"}
        </div>
      </div>

      <div style={{ padding: "24px", flex: 1 }}>
        {error && (
          <div style={{ background: "#FEE2E2", borderRadius: 12, padding: "10px 14px",
            marginBottom: 16, fontSize: 13, color: "#E05A5A", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Étape 1 : Infos */}
        {step === 1 && (
          <>
            {[
              { label: "Ton prénom", val: prenom, set: setPrenom, placeholder: "Comment t'appelle-t-on ?", type: "text" },
              { label: "Email", val: email, set: setEmail, placeholder: "ton@email.com", type: "email" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} type={f.type}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 14, fontSize: 15,
                    border: `1px solid ${C.border}`, outline: "none", background: "#fff",
                    boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 6 }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"} placeholder="6 caractères minimum"
                  style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 14, fontSize: 15,
                    border: `1px solid ${C.border}`, outline: "none", background: "#fff",
                    boxSizing: "border-box", fontFamily: "inherit" }} />
                <button onClick={() => setShowPass(s => !s)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 6 }}>Confirme ton mot de passe</label>
              <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                type="password" placeholder="••••••••"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 14, fontSize: 15,
                  border: `1px solid ${C.border}`, outline: "none", background: "#fff",
                  boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </>
        )}

        {/* Étape 2 : Profil */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 4 }}>Ces infos nous aident à personnaliser ton expérience.</div>
            {PROFILS.map(p => (
              <button key={p.id} onClick={() => setProfil(p.id)}
                style={{ padding: 16, borderRadius: 16, border: profil === p.id ? `2px solid ${C.purple}` : `2px solid ${C.border}`,
                  background: profil === p.id ? C.purplePale : "#fff", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{p.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Étape 3 : Mode */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 4 }}>Tu peux changer ce choix à tout moment dans ton profil.</div>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ padding: 16, borderRadius: 16, border: mode === m.id ? `2px solid ${C.purple}` : `2px solid ${C.border}`,
                  background: mode === m.id ? C.purplePale : "#fff", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{m.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        )}

        {step < 3 ? (
          <button onClick={nextStep}
            style={{ width: "100%", padding: 14, borderRadius: 50, background: C.purple,
              color: "#fff", border: "none", fontWeight: 800, fontSize: 16, cursor: "pointer",
              boxShadow: `0 4px 20px ${C.purple}44`, marginBottom: 16 }}>
            Continuer →
          </button>
        ) : (
          <button onClick={handleRegister} disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 50,
              background: loading ? C.muted : C.purple, color: "#fff", border: "none",
              fontWeight: 800, fontSize: 16, cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : `0 4px 20px ${C.purple}44`, marginBottom: 16 }}>
            {loading ? "Création..." : "Créer mon compte 🌸"}
          </button>
        )}

        {step === 1 && (
          <div style={{ textAlign: "center", fontSize: 14, color: C.muted }}>
            Déjà un compte ?{" "}
            <span onClick={onGoLogin} style={{ color: C.purple, fontWeight: 700, cursor: "pointer" }}>
              Se connecter
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MentalBloom({ user, onLogout }) {
  const [screen, setScreen] = useState(S.HOME);
  const [chatContact, setChatContact] = useState(null);
  const [fiche, setFiche] = useState(null);
  const [coins, setCoins] = useState(user.coins || 45);
  const [quests, setQuests] = useState(QUESTS);
  const [mode, setMode] = useState(user.mode || "Mode libre");

  const addCoins = (n) => setCoins(c => c + n);
  const spendCoins = (n) => setCoins(c => Math.max(0, c - n));

  const noNav = [S.CHAT_ROOM];

  if (screen === S.CHAT_ROOM) return <ChatRoomScreen onBack={() => setScreen(S.CHAT)} contact={chatContact} user={user} />;

  const navItems = [
    { icon: "🏠", label: "Accueil", s: S.HOME },
    { icon: "🗺️", label: "Quêtes", s: S.QUESTS },
    { icon: "💬", label: "Chat", s: S.CHAT },
    { icon: "📚", label: "Ressources", s: S.RESOURCES },
  ];

  const mainScreens = [S.HOME, S.QUESTS, S.CHAT, S.RESOURCES];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        {screen === S.HOME && <HomeScreen setScreen={setScreen} quests={quests} coins={coins} user={user} />}
        {screen === S.QUESTS && <QuestsScreen onBack={() => setScreen(S.HOME)} quests={quests} setQuests={setQuests} addCoins={addCoins} mode={mode} />}
        {screen === S.GAME && <GameScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} />}
        {screen === S.BREATHE    && <BreatheScreen    onBack={() => setScreen(S.GAME)} />}
        {screen === S.SCAN       && <ScanScreen       onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.JOURNAL    && <JournalScreen    onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.GRATITUDE  && <GratitudeScreen  onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.COGNITIF   && <CognitifScreen   onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.COMMUNAUTE && <CommunauteScreen onBack={() => setScreen(S.HOME)} />}
        {screen === S.HUMEUR     && <SuiviHumeurScreen onBack={() => setScreen(S.HOME)} />}
        {screen === S.URGENCES   && <UrgencesScreen   onBack={() => setScreen(S.HOME)} />}
        {screen === S.RAPPELS    && <RappelsScreen    onBack={() => setScreen(S.HOME)} />}
        {screen === S.CHAT && <ChatScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} setChatContact={setChatContact} />}
        {screen === S.LIVE && <LiveScreen onBack={() => setScreen(S.HOME)} />}
        {screen === S.RESOURCES && <ResourcesScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} setFiche={setFiche} />}
        {screen === S.FICHE && <FicheScreen onBack={() => setScreen(S.RESOURCES)} fiche={fiche} />}
        {screen === S.PROFILE && <ProfileScreen onBack={() => setScreen(S.HOME)} coins={coins} quests={quests} mode={mode} setMode={setMode} user={user} onLogout={onLogout} />}
      </div>

      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.bgCard, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 16px" }}>
        {navItems.map(item => (
          <button key={item.s} onClick={() => setScreen(item.s)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 12px", color: screen === item.s ? C.purple : C.muted, fontWeight: screen === item.s ? 700 : 400 }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 11 }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Root App avec auth ───────────────────────────────────────
export default function App() {
  const [authState, setAuthState] = useState("splash"); // splash | onboarding | login | register | app
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user already logged in
    const saved = localStorage.getItem("mb_current_user");
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setAuthState("app");
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem("mb_current_user", JSON.stringify(user));
    setCurrentUser(user);
    setAuthState("app");
  };

  const handleLogout = async () => {
    if (currentUser?.token) await supabase.signOut(currentUser.token);
    localStorage.removeItem("mb_current_user");
    setCurrentUser(null);
    setAuthState("login");
  };

  if (authState === "splash") return <SplashScreen onFinish={() => setAuthState("onboarding")} />;
  if (authState === "onboarding") return <OnboardingScreen onFinish={() => setAuthState("login")} />;
  if (authState === "login") return <LoginScreen onLogin={handleLogin} onGoRegister={() => setAuthState("register")} />;
  if (authState === "register") return <RegisterScreen onRegister={handleLogin} onGoLogin={() => setAuthState("login")} />;
  if (authState === "app") return <MentalBloom user={currentUser} onLogout={handleLogout} />;

  return null;
}
