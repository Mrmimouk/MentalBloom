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
    traitements: ["TCC (Thérapie Cognitive et Comportementale)", "Antidépresseurs si nécessaire", "Activité physique adaptée"],
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



// ─── Components ───────────────────────────────────────────────

// ─── Icônes SVG professionnelles ─────────────────────────────
function Icon({ name, size = 28, color = "currentColor" }) {
  const icons = {
    activities: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    quests: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    resources: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    community: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    mood: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    emergency: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>,
    reminders: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    live: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    breathe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a8 8 0 01-8-8c0-3.5 2-6.5 5-8"/><path d="M12 2a8 8 0 018 8c0 3.5-2 6.5-5 8"/><circle cx="12" cy="12" r="3"/></svg>,
    scan: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>,
    journal: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    gratitude: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    cognitive: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    profile: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    sos: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    coins: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M9 10h4.5a1.5 1.5 0 010 3H10a1.5 1.5 0 000 3H15"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  };
  return icons[name] || null;
}

// ─── PsychoCoin ───────────────────────────────────────────────
function PsychoCoin({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <radialGradient id="coinGold" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="65%" stopColor="#C8A000" />
          <stop offset="100%" stopColor="#8B6000" />
        </radialGradient>
        <radialGradient id="coinInner" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF5B0" />
          <stop offset="40%" stopColor="#F5C400" />
          <stop offset="100%" stopColor="#A07800" />
        </radialGradient>
      </defs>
      <ellipse cx="21" cy="21" rx="17" ry="17" fill="rgba(0,0,0,0.18)" />
      <circle cx="20" cy="20" r="18" fill="url(#coinGold)" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="#FFE44D" strokeWidth="0.6" />
      <circle cx="20" cy="20" r="14" fill="url(#coinInner)" />
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#A07800" strokeWidth="0.8" />
      <text x="21" y="25.5" textAnchor="middle" fontSize="12" fontWeight="900"
        fontFamily="Georgia, serif" fill="#7A5500" letterSpacing="0.5">PC</text>
      <text x="20.5" y="25" textAnchor="middle" fontSize="12" fontWeight="900"
        fontFamily="Georgia, serif" fill="#FFF0A0" letterSpacing="0.5">PC</text>
      <ellipse cx="13" cy="12" rx="5" ry="3" fill="rgba(255,255,255,0.45)" transform="rotate(-35 13 12)" />
    </svg>
  );
}


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
    <button onClick={onBack} style={{ background: "none", border: "none", color: C.purple, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>
      <Icon name="back" size={18} color={C.purple} />
      Retour
    </button>
  );
}

// ─── Screens ──────────────────────────────────────────────────


// ─── Avatars émotions ─────────────────────────────────────────
const EMOTION_AVATARS = [
  // \u2500\u2500 \u00c9motions de base \u2500\u2500
  { id: "joie", emoji: "\ud83d\ude0a", label: "Joie", color: "#FFD700", bg: "#FEF9E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#F0A500" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 60 Q 50 78 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="58" rx="8" ry="5" fill="#FFB3C6" opacity="0.5"/><ellipse cx="75" cy="58" rx="8" ry="5" fill="#FFB3C6" opacity="0.5"/>` },
  { id: "tristesse", emoji: "\ud83d\ude14", label: "Tristesse", color: "#7EB8D4", bg: "#E5F0FF",
    svg: `<circle cx="50" cy="50" r="45" fill="#7EB8D4" stroke="#5A9AC0" stroke-width="2"/><circle cx="35" cy="42" r="6" fill="#2A2540"/><circle cx="65" cy="42" r="6" fill="#2A2540"/><circle cx="37" cy="40" r="2" fill="white"/><circle cx="67" cy="40" r="2" fill="white"/><path d="M 30 65 Q 50 55 70 65" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 28 35 Q 35 30 40 38" stroke="#2A2540" stroke-width="2" fill="none"/><path d="M 72 35 Q 65 30 60 38" stroke="#2A2540" stroke-width="2" fill="none"/><circle cx="38" cy="58" r="3" fill="#A8D4F0" opacity="0.8"/><circle cx="62" cy="60" r="3" fill="#A8D4F0" opacity="0.8"/>` },
  { id: "colere", emoji: "\ud83d\ude21", label: "Col\u00e8re", color: "#E05A5A", bg: "#FEE2E2",
    svg: `<circle cx="50" cy="50" r="45" fill="#E05A5A" stroke="#C04040" stroke-width="2"/><circle cx="35" cy="45" r="6" fill="#2A2540"/><circle cx="65" cy="45" r="6" fill="#2A2540"/><path d="M 30 63 Q 50 55 70 63" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 25 30 L 45 38" stroke="#2A2540" stroke-width="3" stroke-linecap="round"/><path d="M 75 30 L 55 38" stroke="#2A2540" stroke-width="3" stroke-linecap="round"/>` },
  { id: "peur", emoji: "\ud83d\ude31", label: "Peur", color: "#9B8EC4", bg: "#EDE8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#9B8EC4" stroke="#7B6EA4" stroke-width="2"/><ellipse cx="35" cy="42" rx="8" ry="9" fill="#2A2540"/><ellipse cx="65" cy="42" rx="8" ry="9" fill="#2A2540"/><circle cx="37" cy="40" r="3" fill="white"/><circle cx="67" cy="40" r="3" fill="white"/><ellipse cx="50" cy="64" rx="14" ry="10" fill="#2A2540"/><ellipse cx="50" cy="64" rx="10" ry="7" fill="#1A1530"/><path d="M 28 32 Q 36 26 42 34" stroke="#2A2540" stroke-width="2" fill="none"/>` },
  { id: "surprise", emoji: "\ud83d\ude2e", label: "Surprise", color: "#F4C430", bg: "#FEF9E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#F4C430" stroke="#D4A410" stroke-width="2"/><ellipse cx="35" cy="40" rx="7" ry="8" fill="#2A2540"/><ellipse cx="65" cy="40" rx="7" ry="8" fill="#2A2540"/><circle cx="37" cy="38" r="2.5" fill="white"/><circle cx="67" cy="38" r="2.5" fill="white"/><ellipse cx="50" cy="65" rx="12" ry="10" fill="#2A2540"/><path d="M 28 30 Q 35 24 40 32" stroke="#2A2540" stroke-width="2" fill="none"/>` },
  { id: "degout", emoji: "\ud83e\udd22", label: "D\u00e9go\u00fbt", color: "#7BBF9A", bg: "#E4F5EC",
    svg: `<circle cx="50" cy="50" r="45" fill="#7BBF9A" stroke="#5AA882" stroke-width="2"/><path d="M 28 40 Q 35 36 42 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 40 Q 65 36 72 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 35 62 Q 43 57 50 62 Q 57 67 65 62" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 28 33 L 42 38" stroke="#2A2540" stroke-width="2"/><path d="M 72 33 L 58 38" stroke="#2A2540" stroke-width="2"/>` },
  { id: "mepris", emoji: "\ud83d\ude12", label: "M\u00e9pris", color: "#B0A0A0", bg: "#F5F0F0",
    svg: `<circle cx="50" cy="50" r="45" fill="#B0A0A0" stroke="#907080" stroke-width="2"/><path d="M 28 40 Q 35 36 42 42" stroke="#2A2540" stroke-width="2.5" fill="none"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 33 63 Q 45 58 60 65" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },
  { id: "confiance", emoji: "\ud83e\udd1d", label: "Confiance", color: "#4A90D9", bg: "#E5F0FF",
    svg: `<circle cx="50" cy="50" r="45" fill="#4A90D9" stroke="#2A70B9" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 60 Q 50 72 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 15 55 Q 22 48 30 54" stroke="#4A90D9" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 85 55 Q 78 48 70 54" stroke="#4A90D9" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  { id: "anticipation", emoji: "\ud83e\udd29", label: "Anticipation", color: "#FF8C42", bg: "#FEF0E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#FF8C42" stroke="#DD6C22" stroke-width="2"/><circle cx="35" cy="40" r="7" fill="#2A2540"/><circle cx="65" cy="40" r="7" fill="#2A2540"/><circle cx="38" cy="37" r="3" fill="white"/><circle cx="68" cy="37" r="3" fill="white"/><path d="M 28 60 Q 50 76 72 60" stroke="#2A2540" stroke-width="3" fill="#FFB380" stroke-linecap="round"/><path d="M 42 15 L 45 25" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/><path d="M 50 12 L 50 22" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/><path d="M 58 15 L 55 25" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>` },
  { id: "amour", emoji: "\ud83e\udd70", label: "Amour", color: "#E891B0", bg: "#FDEAF2",
    svg: `<circle cx="50" cy="50" r="45" fill="#E891B0" stroke="#C86090" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 28 60 Q 50 76 72 60" stroke="#2A2540" stroke-width="3" fill="#FFB3C6" stroke-linecap="round"/><path d="M 18 22 Q 24 14 30 22 Q 24 30 18 22Z" fill="#E05A5A"/><path d="M 30 15 Q 36 7 42 15 Q 36 23 30 15Z" fill="#E05A5A"/><path d="M 58 15 Q 64 7 70 15 Q 64 23 58 15Z" fill="#E05A5A"/><path d="M 70 22 Q 76 14 82 22 Q 76 30 70 22Z" fill="#E05A5A"/>` },
  { id: "affection", emoji: "\ud83d\ude0d", label: "Affection", color: "#FF69B4", bg: "#FDEAF2",
    svg: `<circle cx="50" cy="50" r="45" fill="#FF69B4" stroke="#DD4994" stroke-width="2"/><path d="M 27 35 Q 33 27 39 35 Q 33 43 27 35Z" fill="#E05A5A"/><path d="M 39 28 Q 45 20 51 28 Q 45 36 39 28Z" fill="#E05A5A"/><path d="M 49 35 Q 55 27 61 35 Q 55 43 49 35Z" fill="#E05A5A"/><path d="M 61 28 Q 67 20 73 28 Q 67 36 61 28Z" fill="#E05A5A"/><path d="M 30 62 Q 50 76 70 62" stroke="#2A2540" stroke-width="3" fill="#FFB3C6" stroke-linecap="round"/>` },
  { id: "compassion", emoji: "\ud83e\udef6", label: "Compassion", color: "#C4AEE8", bg: "#EDE8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#C4AEE8" stroke="#A490C8" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 60 Q 50 74 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 38 68 Q 44 60 50 68 Q 44 76 38 68Z" fill="#E05A5A"/><path d="M 50 65 Q 56 57 62 65 Q 56 73 50 65Z" fill="#E05A5A"/>` },
  { id: "empathie", emoji: "\ud83e\udec2", label: "Empathie", color: "#7BBF9A", bg: "#E4F5EC",
    svg: `<circle cx="50" cy="50" r="45" fill="#7BBF9A" stroke="#5AA882" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 60 Q 50 74 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 12 50 Q 18 40 28 48" stroke="#5AA882" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 88 50 Q 82 40 72 48" stroke="#5AA882" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  { id: "gratitude", emoji: "\ud83d\ude4f", label: "Gratitude", color: "#F4A261", bg: "#FEF0E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#F4A261" stroke="#D48241" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 60 Q 50 74 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 72 L 42 85 L 50 80 L 58 85 L 58 72" stroke="#D48241" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },
  { id: "fierte", emoji: "\ud83d\ude24", label: "Fiert\u00e9", color: "#9B59B6", bg: "#F0E8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#9B59B6" stroke="#7B39A6" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 58 Q 50 70 70 58" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 20 L 50 8 L 58 20" stroke="#FFD700" stroke-width="3" fill="#FFD700" stroke-linecap="round"/><line x1="50" y1="8" x2="50" y2="28" stroke="#FFD700" stroke-width="2"/>` },
  { id: "honte", emoji: "\ud83d\ude33", label: "Honte", color: "#E07070", bg: "#FEE2E2",
    svg: `<circle cx="50" cy="50" r="45" fill="#E07070" stroke="#C05050" stroke-width="2"/><path d="M 28 42 Q 35 38 42 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 42 Q 65 38 72 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 35 65 Q 50 60 65 65" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="28" cy="55" rx="10" ry="7" fill="#FF6B6B" opacity="0.6"/><ellipse cx="72" cy="55" rx="10" ry="7" fill="#FF6B6B" opacity="0.6"/>` },
  { id: "culpabilite", emoji: "\ud83d\ude1e", label: "Culpabilit\u00e9", color: "#8090A0", bg: "#E8EEF5",
    svg: `<circle cx="50" cy="50" r="45" fill="#8090A0" stroke="#607090" stroke-width="2"/><path d="M 28 42 Q 35 38 42 44" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 58 42 Q 65 38 72 44" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 35 66 Q 50 60 65 66" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 42 20 Q 50 14 58 20 Q 50 30 42 20Z" fill="#E05A5A" opacity="0.7"/>` },
  { id: "embarras", emoji: "\ud83d\ude05", label: "Embarras", color: "#F4A0A0", bg: "#FDEAEA",
    svg: `<circle cx="50" cy="50" r="45" fill="#F4A0A0" stroke="#D48080" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 33 62 Q 50 70 67 62" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="20" cy="50" rx="12" ry="8" fill="#FF6B6B" opacity="0.5"/><ellipse cx="80" cy="50" rx="12" ry="8" fill="#FF6B6B" opacity="0.5"/><circle cx="72" cy="32" r="5" fill="#A8D4F0" opacity="0.8"/>` },
  { id: "jalousie", emoji: "\ud83d\ude12", label: "Jalousie", color: "#60A060", bg: "#E4F5E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#60A060" stroke="#408040" stroke-width="2"/><circle cx="35" cy="42" r="6" fill="#2A2540"/><circle cx="65" cy="42" r="6" fill="#2A2540"/><circle cx="37" cy="40" r="2" fill="white"/><circle cx="67" cy="40" r="2" fill="white"/><path d="M 35 63 Q 50 57 65 63" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 28 30 Q 36 24 42 32" stroke="#2A2540" stroke-width="2" fill="none"/>` },
  { id: "envie", emoji: "\ud83e\udee2", label: "Envie", color: "#A0C060", bg: "#F0F8E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#A0C060" stroke="#80A040" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 33 62 Q 50 70 67 62" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 68 22 Q 76 16 80 24" stroke="#FFD700" stroke-width="2" fill="none" stroke-linecap="round"/>` },
  { id: "admiration", emoji: "\ud83e\udd29", label: "Admiration", color: "#FFB830", bg: "#FEF5E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#FFB830" stroke="#DD9810" stroke-width="2"/><path d="M 25 35 Q 35 25 45 35 Q 35 45 25 35Z" fill="#FFD700"/><path d="M 55 35 Q 65 25 75 35 Q 65 45 55 35Z" fill="#FFD700"/><path d="M 28 62 Q 50 76 72 62" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  { id: "soulagement", emoji: "\ud83d\ude0c", label: "Soulagement", color: "#90C890", bg: "#E8F8E8",
    svg: `<circle cx="50" cy="50" r="45" fill="#90C890" stroke="#70A870" stroke-width="2"/><path d="M 28 42 Q 35 38 42 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 42 Q 65 38 72 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 30 60 Q 50 74 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 30 22 Q 50 16 70 22" stroke="#70A870" stroke-width="2" fill="none" stroke-linecap="round"/>` },
  { id: "espoir", emoji: "\ud83c\udf1f", label: "Espoir", color: "#FFD700", bg: "#FEF9E4",
    svg: `<circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#F0B000" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 30 60 Q 50 72 70 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50 5 L 52 15 L 60 12 L 54 20 L 60 26 L 50 22 L 40 26 L 46 20 L 40 12 L 48 15 Z" fill="#FFF" opacity="0.8"/>` },
  { id: "desespoir", emoji: "\ud83d\ude22", label: "D\u00e9sespoir", color: "#5070A0", bg: "#E0E8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#5070A0" stroke="#304080" stroke-width="2"/><path d="M 26 40 Q 35 33 42 40" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 58 40 Q 65 33 72 40" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 32 67 Q 50 58 68 67" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="35" cy="58" r="4" fill="#A8D4F0"/><circle cx="65" cy="60" r="4" fill="#A8D4F0"/><circle cx="32" cy="65" r="3" fill="#A8D4F0"/>` },
  { id: "deception", emoji: "\ud83d\ude1f", label: "D\u00e9ception", color: "#9090B0", bg: "#E8E8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#9090B0" stroke="#7070A0" stroke-width="2"/><path d="M 28 40 Q 35 36 42 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 40 Q 65 36 72 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 33 66 Q 50 58 67 66" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 28 32 Q 36 27 42 34" stroke="#2A2540" stroke-width="2" fill="none"/>` },
  { id: "frustration", emoji: "\ud83d\ude24", label: "Frustration", color: "#D4602A", bg: "#FAEAE0",
    svg: `<circle cx="50" cy="50" r="45" fill="#D4602A" stroke="#B44010" stroke-width="2"/><circle cx="35" cy="43" r="6" fill="#2A2540"/><circle cx="65" cy="43" r="6" fill="#2A2540"/><path d="M 33 63 Q 50 56 67 63" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 28 30 Q 36 25 42 32" stroke="#2A2540" stroke-width="2" fill="none"/><path d="M 72 30 Q 64 25 58 32" stroke="#2A2540" stroke-width="2" fill="none"/><path d="M 44 8 Q 50 4 56 8" stroke="#FF6B35" stroke-width="2" fill="none"/>` },
  { id: "irritation", emoji: "\ud83d\ude20", label: "Irritation", color: "#C05030", bg: "#FAE8E0",
    svg: `<circle cx="50" cy="50" r="45" fill="#C05030" stroke="#A03010" stroke-width="2"/><circle cx="35" cy="44" r="6" fill="#2A2540"/><circle cx="65" cy="44" r="6" fill="#2A2540"/><path d="M 32 64 Q 50 57 68 64" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 26 31 L 44 39" stroke="#2A2540" stroke-width="2.5" stroke-linecap="round"/><path d="M 74 31 L 56 39" stroke="#2A2540" stroke-width="2.5" stroke-linecap="round"/>` },
  { id: "rage", emoji: "\ud83e\udd2c", label: "Rage", color: "#A02020", bg: "#FAE0E0",
    svg: `<circle cx="50" cy="50" r="45" fill="#A02020" stroke="#801010" stroke-width="2"/><circle cx="35" cy="46" r="6" fill="#2A2540"/><circle cx="65" cy="46" r="6" fill="#2A2540"/><path d="M 30 66 Q 50 57 70 66" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 22 28 L 44 39" stroke="#FF4040" stroke-width="3" stroke-linecap="round"/><path d="M 78 28 L 56 39" stroke="#FF4040" stroke-width="3" stroke-linecap="round"/><path d="M 30 18 L 44 30" stroke="#FF6060" stroke-width="2" stroke-linecap="round"/><path d="M 70 18 L 56 30" stroke="#FF6060" stroke-width="2" stroke-linecap="round"/>` },
  { id: "haine", emoji: "\ud83d\ude08", label: "Haine", color: "#601030", bg: "#F0E0E5",
    svg: `<circle cx="50" cy="50" r="45" fill="#601030" stroke="#401020" stroke-width="2"/><circle cx="35" cy="46" r="6" fill="#FF4040"/><circle cx="65" cy="46" r="6" fill="#FF4040"/><path d="M 32 66 Q 50 58 68 66" stroke="#FF8080" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 22 26 L 44 38" stroke="#FF4040" stroke-width="3" stroke-linecap="round"/><path d="M 78 26 L 56 38" stroke="#FF4040" stroke-width="3" stroke-linecap="round"/>` },
  { id: "anxiete", emoji: "\ud83d\ude30", label: "Anxi\u00e9t\u00e9", color: "#A0C4A0", bg: "#E5FFE5",
    svg: `<circle cx="50" cy="50" r="45" fill="#A0C4A0" stroke="#7BA87B" stroke-width="2"/><ellipse cx="35" cy="42" rx="7" ry="6" fill="#2A2540"/><ellipse cx="65" cy="42" rx="7" ry="6" fill="#2A2540"/><circle cx="37" cy="40" r="2" fill="white"/><circle cx="67" cy="40" r="2" fill="white"/><path d="M 35 63 Q 43 58 50 63 Q 57 68 65 63" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="72" cy="38" r="5" fill="#A8D4F0" opacity="0.7"/>` },
  { id: "stress", emoji: "\ud83d\ude2b", label: "Stress", color: "#D4A060", bg: "#FAF0E0",
    svg: `<circle cx="50" cy="50" r="45" fill="#D4A060" stroke="#B48040" stroke-width="2"/><circle cx="35" cy="43" r="6" fill="#2A2540"/><circle cx="65" cy="43" r="6" fill="#2A2540"/><path d="M 33 63 Q 50 56 67 63" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 28 30 Q 36 25 42 32" stroke="#2A2540" stroke-width="2" fill="none"/><path d="M 72 30 Q 64 25 58 32" stroke="#2A2540" stroke-width="2" fill="none"/><text x="68" y="30" font-size="16" fill="#2A2540">!</text>` },
  { id: "panique", emoji: "\ud83d\ude31", label: "Panique", color: "#C060A0", bg: "#F8E8F5",
    svg: `<circle cx="50" cy="50" r="45" fill="#C060A0" stroke="#A04080" stroke-width="2"/><ellipse cx="35" cy="42" rx="8" ry="9" fill="#2A2540"/><ellipse cx="65" cy="42" rx="8" ry="9" fill="#2A2540"/><circle cx="37" cy="39" r="3" fill="white"/><circle cx="67" cy="39" r="3" fill="white"/><ellipse cx="50" cy="65" rx="14" ry="10" fill="#2A2540"/><path d="M 28 30 Q 36 24 42 32" stroke="#2A2540" stroke-width="2" fill="none"/><path d="M 72 30 Q 64 24 58 32" stroke="#2A2540" stroke-width="2" fill="none"/>` },
  { id: "inquietude", emoji: "\ud83d\ude1f", label: "Inqui\u00e9tude", color: "#8090B0", bg: "#E8EEF8",
    svg: `<circle cx="50" cy="50" r="45" fill="#8090B0" stroke="#607090" stroke-width="2"/><path d="M 28 42 Q 35 37 42 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 42 Q 65 37 72 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 34 64 Q 50 57 66 64" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 42 22 Q 50 15 58 22" stroke="#2A2540" stroke-width="2" fill="none"/>` },
  { id: "timidite", emoji: "\ud83e\udee3", label: "Timidit\u00e9", color: "#F4B0B0", bg: "#FDEAEA",
    svg: `<circle cx="50" cy="50" r="45" fill="#F4B0B0" stroke="#D49090" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 35 64 Q 50 58 65 64" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="54" rx="11" ry="8" fill="#FF9090" opacity="0.6"/><ellipse cx="75" cy="54" rx="11" ry="8" fill="#FF9090" opacity="0.6"/>` },
  { id: "solitude", emoji: "\ud83d\ude36", label: "Solitude", color: "#7080A0", bg: "#E5EAF5",
    svg: `<circle cx="50" cy="50" r="45" fill="#7080A0" stroke="#506080" stroke-width="2"/><path d="M 28 42 Q 35 38 42 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 42 Q 65 38 72 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="35" y1="64" x2="65" y2="64" stroke="#2A2540" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="50" r="4" fill="#7080A0" opacity="0.4"/><circle cx="80" cy="50" r="4" fill="#7080A0" opacity="0.4"/>` },
  { id: "nostalgie", emoji: "\ud83e\udd79", label: "Nostalgie", color: "#B0A0C0", bg: "#EDE8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#B0A0C0" stroke="#9080B0" stroke-width="2"/><path d="M 28 42 Q 35 38 42 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 42 Q 65 38 72 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 32 62 Q 50 70 68 62" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="38" cy="55" r="3" fill="#A8D4F0" opacity="0.7"/><path d="M 70 18 Q 78 12 84 20" stroke="#B0A0C0" stroke-width="2" fill="none"/>` },
  { id: "melancolie", emoji: "\ud83d\ude2a", label: "M\u00e9lancolie", color: "#6080A0", bg: "#E0E8F5",
    svg: `<circle cx="50" cy="50" r="45" fill="#6080A0" stroke="#406080" stroke-width="2"/><path d="M 27 42 Q 35 37 43 42" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 57 42 Q 65 37 73 42" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 33 66 Q 50 60 67 66" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="37" cy="56" r="3" fill="#A8D4F0" opacity="0.7"/><path d="M 38 59 Q 36 65 35 70" stroke="#A8D4F0" stroke-width="1.5" fill="none"/>` },
  { id: "ennui", emoji: "\ud83d\ude11", label: "Ennui", color: "#A0A0A0", bg: "#F0F0F0",
    svg: `<circle cx="50" cy="50" r="45" fill="#A0A0A0" stroke="#808080" stroke-width="2"/><path d="M 28 40 Q 35 36 42 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 40 Q 65 36 72 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="33" y1="63" x2="67" y2="63" stroke="#2A2540" stroke-width="2.5" stroke-linecap="round"/><text x="68" y="35" font-size="14" fill="#808080">z</text><text x="74" y="26" font-size="11" fill="#808080">z</text>` },
  { id: "curiosite", emoji: "\ud83e\uddd0", label: "Curiosit\u00e9", color: "#60A0C0", bg: "#E0F0F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#60A0C0" stroke="#4080A0" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 33 62 Q 50 70 67 62" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><text x="63" y="32" font-size="20" fill="#2A2540">?</text>` },
  { id: "emerveillement", emoji: "\ud83e\udd2f", label: "\u00c9merveillement", color: "#FFB0D0", bg: "#FDE8F5",
    svg: `<circle cx="50" cy="50" r="45" fill="#FFB0D0" stroke="#DD90B0" stroke-width="2"/><circle cx="35" cy="40" r="7" fill="#2A2540"/><circle cx="65" cy="40" r="7" fill="#2A2540"/><circle cx="38" cy="37" r="3" fill="white"/><circle cx="68" cy="37" r="3" fill="white"/><path d="M 28 60 Q 50 75 72 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 10 L 44 20" stroke="#FFD700" stroke-width="2"/><path d="M 50 8 L 50 18" stroke="#FFD700" stroke-width="2"/><path d="M 58 10 L 56 20" stroke="#FFD700" stroke-width="2"/><path d="M 35 14 L 40 22" stroke="#FFD700" stroke-width="2"/><path d="M 65 14 L 60 22" stroke="#FFD700" stroke-width="2"/>` },
  { id: "excitation", emoji: "\ud83e\udd29", label: "Excitation", color: "#FF6080", bg: "#FDEAEE",
    svg: `<circle cx="50" cy="50" r="45" fill="#FF6080" stroke="#DD4060" stroke-width="2"/><circle cx="35" cy="40" r="7" fill="#2A2540"/><circle cx="65" cy="40" r="7" fill="#2A2540"/><circle cx="38" cy="37" r="3" fill="white"/><circle cx="68" cy="37" r="3" fill="white"/><path d="M 26 60 Q 50 78 74 60" stroke="#2A2540" stroke-width="3" fill="#FFB0C0" stroke-linecap="round"/><path d="M 20 30 L 28 38" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><path d="M 80 30 L 72 38" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/>` },
  { id: "satisfaction", emoji: "\ud83d\ude0f", label: "Satisfaction", color: "#70B070", bg: "#E8F5E8",
    svg: `<circle cx="50" cy="50" r="45" fill="#70B070" stroke="#508050" stroke-width="2"/><path d="M 28 40 Q 35 36 42 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 40 Q 65 36 72 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 32 60 Q 50 72 68 60" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  { id: "serenite", emoji: "\ud83d\ude0a", label: "S\u00e9r\u00e9nit\u00e9", color: "#90C8C8", bg: "#E8F8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#90C8C8" stroke="#70A8A8" stroke-width="2"/><path d="M 27 42 Q 35 38 43 42" stroke="#2A2540" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M 57 42 Q 65 38 73 42" stroke="#2A2540" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M 30 60 Q 50 72 70 60" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="56" rx="7" ry="5" fill="#FFB3C6" opacity="0.3"/><ellipse cx="75" cy="56" rx="7" ry="5" fill="#FFB3C6" opacity="0.3"/>` },
  { id: "etonnement", emoji: "\ud83d\ude32", label: "\u00c9tonnement", color: "#C0A040", bg: "#F8F0E0",
    svg: `<circle cx="50" cy="50" r="45" fill="#C0A040" stroke="#A08020" stroke-width="2"/><ellipse cx="35" cy="40" rx="7" ry="8" fill="#2A2540"/><ellipse cx="65" cy="40" rx="7" ry="8" fill="#2A2540"/><circle cx="37" cy="38" r="2.5" fill="white"/><circle cx="67" cy="38" r="2.5" fill="white"/><ellipse cx="50" cy="64" rx="11" ry="9" fill="#2A2540"/>` },
  { id: "confusion", emoji: "\ud83d\ude15", label: "Confusion", color: "#C4AEE8", bg: "#EDE8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#C4AEE8" stroke="#A490C8" stroke-width="2"/><circle cx="35" cy="42" r="6" fill="#2A2540"/><circle cx="65" cy="42" r="6" fill="#2A2540"/><circle cx="37" cy="40" r="2" fill="white"/><circle cx="67" cy="40" r="2" fill="white"/><path d="M 36 63 Q 43 60 50 65 Q 57 60 64 63" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><text x="66" y="32" font-size="18" fill="#2A2540">?</text>` },
  { id: "determination", emoji: "\ud83d\ude24", label: "D\u00e9termination", color: "#2060A0", bg: "#E0EAF8",
    svg: `<circle cx="50" cy="50" r="45" fill="#2060A0" stroke="#1040A0" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 28 58 Q 50 68 72 58" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 26 30 L 44 38" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M 74 30 L 56 38" stroke="white" stroke-width="2.5" stroke-linecap="round"/>` },
  { id: "courage", emoji: "\ud83d\udcaa", label: "Courage", color: "#E08020", bg: "#FAF0E0",
    svg: `<circle cx="50" cy="50" r="45" fill="#E08020" stroke="#C06000" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 28 58 Q 50 70 72 58" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 20 L 50 8 L 58 20 L 54 20 L 50 12 L 46 20 Z" fill="#FFD700"/>` },
  { id: "resignation", emoji: "\ud83d\ude2e\u200d\ud83d\udca8", label: "R\u00e9signation", color: "#9090A0", bg: "#EAEAF5",
    svg: `<circle cx="50" cy="50" r="45" fill="#9090A0" stroke="#707090" stroke-width="2"/><path d="M 27 40 Q 35 36 43 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 57 40 Q 65 36 73 40" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="34" y1="63" x2="66" y2="63" stroke="#2A2540" stroke-width="2.5" stroke-linecap="round"/><path d="M 30 72 Q 50 78 70 72" stroke="#9090A0" stroke-width="2" fill="none" stroke-linecap="round"/>` },
  { id: "decouragement", emoji: "\ud83d\ude1e", label: "D\u00e9couragement", color: "#7070A0", bg: "#E8E8F8",
    svg: `<circle cx="50" cy="50" r="45" fill="#7070A0" stroke="#505090" stroke-width="2"/><path d="M 26 40 Q 35 34 44 40" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 56 40 Q 65 34 74 40" stroke="#2A2540" stroke-width="2.5" fill="none"/><path d="M 32 67 Q 50 59 68 67" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 38 22 Q 50 16 62 22" stroke="#7070A0" stroke-width="2" fill="none" stroke-dasharray="3,3"/>` },
  { id: "optimisme", emoji: "\ud83d\ude04", label: "Optimisme", color: "#60C060", bg: "#E8F8E8",
    svg: `<circle cx="50" cy="50" r="45" fill="#60C060" stroke="#40A040" stroke-width="2"/><circle cx="35" cy="40" r="6" fill="#2A2540"/><circle cx="65" cy="40" r="6" fill="#2A2540"/><circle cx="37" cy="38" r="2" fill="white"/><circle cx="67" cy="38" r="2" fill="white"/><path d="M 27 59 Q 50 76 73 59" stroke="#2A2540" stroke-width="3" fill="#A0E8A0" stroke-linecap="round"/><path d="M 42 15 L 50 5 L 58 15" stroke="#FFD700" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },
  { id: "pessimisme", emoji: "\ud83d\ude12", label: "Pessimisme", color: "#607090", bg: "#E8EAF5",
    svg: `<circle cx="50" cy="50" r="45" fill="#607090" stroke="#405070" stroke-width="2"/><path d="M 28 42 Q 35 37 42 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 42 Q 65 37 72 42" stroke="#2A2540" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 33 67 Q 50 59 67 67" stroke="#2A2540" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 38 24 Q 50 18 62 24" stroke="#607090" stroke-width="2" fill="none" stroke-dasharray="4,3"/>` },
];

function AvatarEmotion({ avatar, size = 80 }) {
  const av = EMOTION_AVATARS.find(a => a.id === avatar) || EMOTION_AVATARS[0];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden",
      border: `3px solid ${av.color}`, boxShadow: `0 4px 16px ${av.color}66` }}>
      <svg width={size} height={size} viewBox="0 0 100 100"
        dangerouslySetInnerHTML={{ __html: av.svg }} />
    </div>
  );
}

function AvatarSelector({ onClose, currentAvatar, onSelect }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.bgCard, borderRadius: "24px 24px 0 0", padding: 24,
        width: "100%", maxWidth: 430, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ fontWeight: 800, color: C.text, fontSize: 18, marginBottom: 16 }}>
          Comment tu te sens ? 💜
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {EMOTION_AVATARS.map(av => (
            <button key={av.id} onClick={() => { onSelect(av.id); onClose(); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: currentAvatar === av.id ? av.bg : "transparent",
                border: currentAvatar === av.id ? `2px solid ${av.color}` : "2px solid transparent",
                borderRadius: 16, padding: 8, cursor: "pointer" }}>
              <AvatarEmotion avatar={av.id} size={48} />
              <span style={{ fontSize: 9, color: C.muted, textAlign: "center", lineHeight: 1.2 }}>
                {av.label}
              </span>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 12, marginTop: 16,
          borderRadius: 50, background: C.border, border: "none", fontWeight: 700,
          color: C.muted, cursor: "pointer" }}>Fermer</button>
      </div>
    </div>
  );
}

function HomeScreen({ setScreen, quests, coins, user, currentAvatar, setCurrentAvatar }) {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const done = quests.filter(q => q.done).length;
  return (
    <div style={{ padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Bonjour {user?.prenom || ""} 🌸</div>
          <div style={{ fontSize: 13, color: C.muted }}>Comment tu vas aujourd'hui ?</div>
        </div>
        <button onClick={() => setShowAvatarSelector(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <AvatarEmotion avatar={currentAvatar} size={46} />
        </button>
      </div>

      {/* PsychoCoins */}
      <Card style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`, border: "none", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>MES PSYCHOCOINS</div>
            <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><PsychoCoin size={32} />{coins}</div>
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
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E05A5A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sos" size={20} color="#fff" />
          </div>
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
          { svg: "activities", label: "Activités", sub: "Exercices & jeux", s: S.GAME, color: C.purple },
          { svg: "quests", label: "Quêtes", sub: `${done}/${quests.length} aujourd'hui`, s: S.QUESTS, color: C.green },
          { svg: "chat", label: "Parler", sub: "Soignants & pairs", s: S.CHAT, color: C.orange },
          { svg: "resources", label: "Ressources", sub: "Fiches & guides", s: S.RESOURCES, color: C.pink },
          { svg: "community", label: "Communauté", sub: "Espace d'échange", s: S.COMMUNAUTE, color: C.purple },
          { svg: "mood", label: "Mon humeur", sub: "Suivi émotionnel", s: S.HUMEUR, color: C.green },
          { svg: "emergency", label: "Urgences", sub: "Contacts & structures", s: S.URGENCES, color: "#E05A5A" },
          { svg: "reminders", label: "Rappels", sub: "Doux et sans pression", s: S.RAPPELS, color: C.orange },
        ].map(item => (
          <Card key={item.s} onClick={() => setScreen(item.s)} style={{ borderTop: `3px solid ${item.color}`, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <Icon name={item.svg} size={28} color={item.color} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{item.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.sub}</div>
          </Card>
        ))}
      </div>

      {/* Lives */}
      <div style={{ marginBottom: 20 }}>
        <Card onClick={() => setScreen(S.LIVE)} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: C.purplePale, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="live" size={24} color={C.purple} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Lives avec des professionnels</div>
            <div style={{ fontSize: 12, color: C.muted }}>2 à 3 par semaine</div>
          </div>
          <span style={{ marginLeft: "auto" }}><Icon name="arrow" size={16} color={C.purple} /></span>
        </Card>
      </div>

      {/* Conseil */}
      <Card style={{ background: C.purplePale, border: "none" }}>
        <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.7 }}>
          ✨ <strong>Se lever le matin, c'est déjà beaucoup.</strong> Cette appli ne récompense pas la performance. Elle valorise ta présence, tes petits pas, et ta persévérance.
        </p>
      </Card>

      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={currentAvatar}
          onSelect={setCurrentAvatar}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
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
          <PsychoCoin size={28} />
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
            {g.ready ? <Icon name="arrow" size={18} color={C.purple} /> : <Tag label="Bientôt" color={C.muted} bg={C.border} />}
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

function CommunauteScreen({ onBack, user }) {
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [newPost, setNewPost] = useState("");
  const [showWrite, setShowWrite] = useState(false);
  const [tab, setTab] = useState("fil");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Charger les vrais posts depuis Supabase
  useEffect(() => {
    const loadPosts = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const data = await supabase.getPosts(user.token);
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(p => ({
            id: p.id,
            user: p.user_name || "Anonyme",
            emoji: ["🌸","🌊","🌻","⭐","🎵","💜","🌿"][Math.floor(Math.random()*7)],
            time: timeAgo(p.created_at),
            text: p.content,
            likes: p.likes || 0,
            comments: 0,
            liked: false,
            real: true,
          }));
          setPosts([...formatted, ...COMMUNITY_POSTS]);
        }
      } catch(e) { console.log("Could not load posts"); }
      setLoading(false);
    };
    loadPosts();
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return "il y a " + mins + " min";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return "il y a " + hours + "h";
    return "il y a " + Math.floor(hours/24) + "j";
  };

  const toggleLike = (id) => {
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  };

  const publish = async () => {
    if (!newPost.trim() || publishing) return;
    setPublishing(true);
    const optimistic = {
      id: Date.now(),
      user: user?.prenom || "Moi",
      emoji: "🌸",
      time: "à l'instant",
      text: newPost,
      likes: 0, comments: 0, liked: false, real: true,
    };
    setPosts(prev => [optimistic, ...prev]);
    setNewPost("");
    setShowWrite(false);

    try {
      if (user?.token) {
        await supabase.createPost({
          user_id: user.id,
          user_name: user.prenom || "Anonyme",
          content: optimistic.text,
          likes: 0,
          created_at: new Date().toISOString()
        }, user.token);
      }
    } catch(e) { console.log("Post save error", e); }
    setPublishing(false);
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
          {loading && (
            <div style={{ textAlign: "center", padding: 20, color: C.muted, fontSize: 14 }}>
              Chargement des posts... 🌸
            </div>
          )}
          {posts.map(p => (
            <Card key={p.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.purplePale,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {p.emoji}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.user}</span>
                    {p.real && <span style={{ fontSize: 10, background: C.greenPale, color: C.green, padding: "2px 6px", borderRadius: 8, fontWeight: 700 }}>Réel</span>}
                  </div>
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

function SuiviHumeurScreen({ onBack, user }) {
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

  // Charger l'historique depuis Supabase
  useEffect(() => {
    const loadHumeur = async () => {
      if (!user?.token || !user?.id) return;
      try {
        const data = await supabase.getHumeur(user.id, user.token);
        if (Array.isArray(data) && data.length > 0) {
          const days = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
          const updated = HUMEUR_DATA.map(d => {
            const match = data.find(h => {
              const hDay = new Date(h.created_at).getDay();
              return days[hDay] === d.jour;
            });
            return match ? { ...d, score: match.score, emoji: HUMEURS[match.score-1]?.emoji || d.emoji } : d;
          });
          setData(updated);
        }
      } catch(e) { console.log("Could not load humeur"); }
    };
    loadHumeur();
  }, []);

  const logToday = async (score) => {
    setData(prev => prev.map((d, i) => i === prev.length - 1 ? { ...d, score, emoji: HUMEURS[score-1].emoji } : d));
    setSelected(score);
    try {
      if (user?.token) {
        await supabase.saveHumeur({
          user_id: user.id,
          score,
          note: "",
          created_at: new Date().toISOString()
        }, user.token);
      }
    } catch(e) { console.log("Could not save humeur"); }
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
  // Num\u00e9ros nationaux
  { nom: "3114 \u2014 Pr\u00e9vention suicide", type: "National", tel: "3114", ouvert: "24h/24 \u00b7 Gratuit \u00b7 Confidentiel", color: "#E05A5A", bg: "#FEE2E2", emoji: "\ud83c\udd98", region: "France enti\u00e8re" },
  { nom: "SAMU", type: "National", tel: "15", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\ud83d\ude91", region: "France enti\u00e8re" },
  { nom: "SOS Amiti\u00e9", type: "\u00c9coute", tel: "09 72 39 40 50", ouvert: "24h/24", color: C.pink, bg: C.pinkPale, emoji: "\ud83d\udcac", region: "France enti\u00e8re" },
  { nom: "Fil Sant\u00e9 Jeunes", type: "\u00c9coute", tel: "0800 235 236", ouvert: "8h-minuit \u00b7 Gratuit", color: C.green, bg: C.greenPale, emoji: "\ud83c\udf31", region: "France enti\u00e8re" },
  { nom: "Num\u00e9ro National Handicap", type: "\u00c9coute", tel: "0800 360 360", ouvert: "Lun-Ven 9h-17h \u00b7 Gratuit", color: C.orange, bg: C.orangePale, emoji: "\u267f", region: "France enti\u00e8re" },
  { nom: "Violences femmes info", type: "\u00c9coute", tel: "3919", ouvert: "24h/24 \u00b7 Gratuit", color: C.pink, bg: C.pinkPale, emoji: "\ud83e\udd1d", region: "France enti\u00e8re" },
  { nom: "Suicide \u00c9coute", type: "\u00c9coute", tel: "01 45 39 40 00", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\ud83d\udc99", region: "France enti\u00e8re" },
  // \u00cele-de-France
  { nom: "CPOA \u2014 Urgences psy \u00cele-de-France", type: "Urgence", tel: "01 45 65 81 09", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "\u00cele-de-France", ville: "Paris 14e" },
  { nom: "H\u00f4pital Lariboisi\u00e8re", type: "H\u00f4pital", tel: "01 49 95 64 43", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "\u00cele-de-France", ville: "Paris 10e" },
  { nom: "H\u00f4pital Saint-Antoine", type: "H\u00f4pital", tel: "01 49 28 27 08", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "\u00cele-de-France", ville: "Paris 12e" },
  { nom: "Piti\u00e9-Salp\u00eatri\u00e8re", type: "H\u00f4pital", tel: "01 42 17 72 47", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "\u00cele-de-France", ville: "Paris 13e" },
  { nom: "H\u00f4pital Georges Pompidou", type: "H\u00f4pital", tel: "01 56 09 29 36", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "\u00cele-de-France", ville: "Paris 15e" },
  { nom: "Clinique des Lilas", type: "Clinique", tel: "01 49 72 72 00", ouvert: "24h/24", color: C.orange, bg: C.orangePale, emoji: "\ud83c\udfe5", region: "\u00cele-de-France", ville: "Les Lilas 93" },
  // Nord
  { nom: "CHRU Lille \u2014 Centre d'Accueil de Crise", type: "Urgence", tel: "03 20 44 45 19", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Nord", ville: "Lille" },
  { nom: "Centre Psy d'Admission Lille", type: "Urgence", tel: "03 20 78 22 22", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Nord", ville: "Lille" },
  // Rh\u00f4ne-Alpes
  { nom: "CHU Lyon \u2014 Urgences Psy", type: "Urgence", tel: "04 72 11 69 11", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Auvergne-Rh\u00f4ne-Alpes", ville: "Lyon" },
  { nom: "Centre Antipoison Lyon", type: "Urgence", tel: "04 75 11 69 11", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\u260e\ufe0f", region: "Auvergne-Rh\u00f4ne-Alpes", ville: "Lyon" },
  // PACA
  { nom: "CHU Marseille \u2014 La Timone", type: "Urgence", tel: "04 91 38 60 00", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "PACA", ville: "Marseille" },
  { nom: "Centre Antipoison Marseille", type: "Urgence", tel: "04 91 75 25 25", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\u260e\ufe0f", region: "PACA", ville: "Marseille" },
  // Occitanie
  { nom: "CHU Toulouse \u2014 Urgences Psy", type: "Urgence", tel: "05 61 77 22 33", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Occitanie", ville: "Toulouse" },
  { nom: "Centre Antipoison Toulouse", type: "Urgence", tel: "05 61 77 74 47", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\u260e\ufe0f", region: "Occitanie", ville: "Toulouse" },
  // Nouvelle-Aquitaine
  { nom: "CHU Bordeaux \u2014 Urgences Psy", type: "Urgence", tel: "05 56 79 56 79", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Nouvelle-Aquitaine", ville: "Bordeaux" },
  { nom: "Centre Antipoison Bordeaux", type: "Urgence", tel: "05 56 96 40 80", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\u260e\ufe0f", region: "Nouvelle-Aquitaine", ville: "Bordeaux" },
  // Grand Est
  { nom: "CHU Strasbourg \u2014 Urgences Psy", type: "Urgence", tel: "03 88 11 67 68", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Grand Est", ville: "Strasbourg" },
  { nom: "Centre Antipoison Strasbourg", type: "Urgence", tel: "03 88 37 37 37", ouvert: "24h/24", color: "#E05A5A", bg: "#FEE2E2", emoji: "\u260e\ufe0f", region: "Grand Est", ville: "Strasbourg" },
  { nom: "CHU Nancy \u2014 Urgences Psy", type: "Urgence", tel: "03 83 22 50 50", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Grand Est", ville: "Nancy" },
  // Bretagne
  { nom: "CHU Rennes \u2014 Urgences Psy", type: "Urgence", tel: "02 99 26 71 28", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Bretagne", ville: "Rennes" },
  // Pays de la Loire
  { nom: "CHU Nantes \u2014 Urgences Psy", type: "Urgence", tel: "02 40 08 33 33", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Pays de la Loire", ville: "Nantes" },
  // Centre-Val de Loire
  { nom: "CHU Tours \u2014 Centre d'Accueil de Crise", type: "Urgence", tel: "02 47 47 98 08", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Centre-Val de Loire", ville: "Tours" },
  // Normandie
  { nom: "CHU Rouen \u2014 Urgences Psy", type: "Urgence", tel: "02 32 88 89 90", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Normandie", ville: "Rouen" },
  // Bourgogne
  { nom: "CHU Dijon \u2014 Urgences Psy", type: "Urgence", tel: "03 80 29 30 31", ouvert: "24h/24", color: C.purple, bg: C.purplePale, emoji: "\ud83c\udfe5", region: "Bourgogne-Franche-Comt\u00e9", ville: "Dijon" },
  // DOM-TOM
  { nom: "CHU Martinique \u2014 Urgences Psy", type: "Urgence", tel: "05 96 55 20 00", ouvert: "24h/24", color: C.orange, bg: C.orangePale, emoji: "\ud83c\udfe5", region: "Martinique", ville: "Fort-de-France" },
  { nom: "CHU Guadeloupe \u2014 Urgences Psy", type: "Urgence", tel: "05 90 89 10 10", ouvert: "24h/24", color: C.orange, bg: C.orangePale, emoji: "\ud83c\udfe5", region: "Guadeloupe", ville: "Pointe-\u00e0-Pitre" },
  { nom: "CHU La R\u00e9union \u2014 Urgences Psy", type: "Urgence", tel: "02 62 90 50 50", ouvert: "24h/24", color: C.orange, bg: C.orangePale, emoji: "\ud83c\udfe5", region: "La R\u00e9union", ville: "Saint-Denis" },
];

const REGIONS = ["Toutes", "France entière", "Île-de-France", "Nord", "Auvergne-Rhône-Alpes", "PACA", "Occitanie", "Nouvelle-Aquitaine", "Grand Est", "Bretagne", "Pays de la Loire", "Centre-Val de Loire", "Normandie", "Bourgogne-Franche-Comté", "Martinique", "Guadeloupe", "La Réunion"];


function UrgencesScreen({ onBack }) {
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [region, setRegion] = useState("Toutes");

  const filtres = ["tous", "national", "urgence", "hôpital", "écoute"];

  const filtered = URGENCES_DATA.filter(u => {
    const matchSearch = u.nom.toLowerCase().includes(search.toLowerCase()) ||
      (u.ville && u.ville.toLowerCase().includes(search.toLowerCase()));
    const matchFiltre = filtre === "tous" ||
      (filtre === "national" && u.region === "France entière") ||
      (filtre === "urgence" && (u.type === "Urgence" || u.type === "National")) ||
      (filtre === "hôpital" && (u.type === "Hôpital" || u.type === "Clinique")) ||
      (filtre === "écoute" && u.type === "Écoute");
    const matchRegion = region === "Toutes" || u.region === region;
    return matchSearch && matchFiltre && matchRegion;
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

      {/* Filtres type */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {filtres.map(f => (
          <button key={f} onClick={() => setFiltre(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700,
            fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            background: filtre === f ? C.purple : C.border,
            color: filtre === f ? "#fff" : C.muted,
          }}>{f}</button>
        ))}
      </div>
      {/* Filtre région */}
      <select value={region} onChange={e => setRegion(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
          outline: "none", fontSize: 14, background: C.bg, marginBottom: 16,
          color: C.text, cursor: "pointer" }}>
        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((u, i) => (
          <Card key={i} style={{ background: u.bg, border: `1px solid ${u.color}33` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{u.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{u.nom}</div>
                <div style={{ fontSize: 12, color: u.color, fontWeight: 600, marginTop: 2 }}>{u.type}</div>
                {u.ville && <div style={{ fontSize: 12, color: C.muted }}>📍 {u.ville}</div>}
              {u.region && u.region !== "France entière" && <div style={{ fontSize: 11, color: C.purple, fontWeight: 600 }}>🗺 {u.region}</div>}
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
        <button onClick={send} disabled={sending} style={{
          width: 44, height: 44, borderRadius: "50%", border: "none",
          background: sending ? C.muted : C.purple, cursor: sending ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: sending ? "none" : `0 2px 8px ${C.purple}44`, flexShrink: 0
        }}>
          <Icon name="send" size={18} color="#fff" />
        </button>
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
        {["fiches", "médicaments", "droits"].map(t => (
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
              <span style={{ marginLeft: "auto" }}><Icon name="arrow" size={16} color={C.purple} /></span>
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
  const [tab, setTab] = useState("profil");
  const PROFIL_LABELS = { souffrance: "Personne en souffrance", proche: "Proche d'une personne en souffrance", ami: "Ami·e qui vient soutenir", specialiste: "Professionnel de santé mentale", visiteur: "Visiteur·trice", modo: "Modérateur·trice" };
  const PROFIL_COLORS = { souffrance: C.purple, proche: C.green, ami: C.orange, specialiste: C.pink, visiteur: "#7090B0", modo: "#2060A0" };
  const profilColor = PROFIL_COLORS[user?.profil] || C.purple;

  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <Card style={{ textAlign: "center", padding: 20, marginBottom: 16, background: "linear-gradient(135deg, " + profilColor + "22, " + C.greenPale + ")", border: "none" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: profilColor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: "2px solid " + profilColor, margin: "0 auto 10px" }}>👤</div>
        <div style={{ fontWeight: 800, color: C.text, fontSize: 18 }}>{user?.prenom} {user?.nom}</div>
        <div style={{ fontSize: 13, color: profilColor, fontWeight: 700, marginTop: 4 }}>{PROFIL_LABELS[user?.profil] || "Utilisateur·trice"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: C.purple, fontSize: 20 }}>{coins}</div>
            <div style={{ fontSize: 11, color: C.muted }}>PsychoCoins</div>
          </div>
          <div style={{ width: 1, background: C.border }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: C.green, fontSize: 20 }}>{done}</div>
            <div style={{ fontSize: 11, color: C.muted }}>Quêtes aujourd'hui</div>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{id:"profil",label:"Mon profil"},{id:"infos",label:"Mes informations"},{id:"compte",label:"Compte"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 20, border: "none", background: tab === t.id ? C.purple : C.border, color: tab === t.id ? "#fff" : C.muted, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {tab === "profil" && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>Mon profil Heïdi</div>
            <div style={{ padding: "8px 0", borderBottom: "1px solid " + C.border }}>
              <div style={{ fontSize: 12, color: C.muted }}>Type de profil</div>
              <div style={{ fontWeight: 700, color: profilColor, marginTop: 2 }}>{PROFIL_LABELS[user?.profil] || "Non défini"}</div>
            </div>
            {user?.maladies?.length > 0 && (
              <div style={{ paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Pathologies</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {user.maladies.map((m, i) => <span key={i} style={{ background: C.purplePale, color: C.purple, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{m}</span>)}
                </div>
              </div>
            )}
            {user?.lienParente && <div style={{ paddingTop: 10, fontSize: 13, color: C.muted }}>Lien : <strong style={{ color: C.text }}>{user.lienParente}</strong></div>}
            {user?.profession && <div style={{ paddingTop: 10, fontSize: 13, color: C.muted }}>Profession : <strong style={{ color: C.text }}>{user.profession}</strong></div>}
          </Card>
          <Card style={{ background: C.purplePale, border: "none" }}>
            <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>🔒 <strong>Tes données t'appartiennent.</strong> Heïdi respecte le RGPD.</p>
          </Card>
        </>
      )}

      {tab === "infos" && (
        <Card>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>🔒 Mes informations personnelles</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, background: C.purplePale, padding: "8px 12px", borderRadius: 10 }}>Visibles uniquement par toi et les modérateurs.</div>
          {[
            { label: "Prénom", val: user?.prenom },
            { label: "Nom", val: user?.nom },
            { label: "Genre", val: user?.genre },
            { label: "Date de naissance", val: user?.dateNaissance },
            { label: "Ville", val: user?.ville },
            { label: "Code postal", val: user?.codePostal },
            { label: "Email", val: user?.email },
          ].filter(i => i.val).map((item, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length-1 ? "1px solid " + C.border : "none" }}>
              <div style={{ fontSize: 13, color: C.muted }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.val}</div>
            </div>
          ))}
        </Card>
      )}

      {tab === "compte" && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 12 }}>Paramètres du compte</div>
            <div style={{ fontSize: 13, color: C.muted, padding: "10px 0" }}>Email : <strong style={{ color: C.text }}>{user?.email}</strong></div>
          </Card>
          <Card style={{ background: "#FEE2E2", border: "1px solid " + C.urgent + "33", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: C.urgent, marginBottom: 8 }}>Se déconnecter</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Tu pourras te reconnecter à tout moment.</div>
            <button onClick={onLogout} style={{ width: "100%", padding: 12, borderRadius: 50, background: C.urgent, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Se déconnecter</button>
          </Card>
          <Card style={{ background: C.purplePale, border: "none" }}>
            <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>🔒 <strong>Tes données t'appartiennent.</strong> Heïdi respecte le RGPD.</p>
          </Card>
        </>
      )}
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
      <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Heïdi</div>
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
      title: "Bienvenue sur Heidi",
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
      desc: "Heidi ne récompense pas la performance. Il valorise ta présence et tes petits pas.",
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


// ─── Sélecteur de date ────────────────────────────────────────
function DateSelecteur({ value, onChange }) {
  const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const now = new Date();
  const parts = value ? value.split("-") : ["","",""];
  const [year, setYear] = useState(parts[0] || "");
  const [month, setMonth] = useState(parts[1] || "");
  const [day, setDay] = useState(parts[2] || "");
  const years = Array.from({ length: 100 }, (_, i) => String(now.getFullYear() - i));
  const daysInMonth = (year && month) ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  useEffect(() => {
    if (year && month && day) onChange(year + "-" + month + "-" + day);
  }, [year, month, day]);

  const sel = { padding: "11px 8px", borderRadius: 12, fontSize: 13, border: "1px solid " + C.border, outline: "none", background: "#fff", fontFamily: "inherit", color: C.text, cursor: "pointer", width: "100%" };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>
        Date de naissance <span style={{ color: "#E05A5A" }}>*</span>
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <select value={day} onChange={e => setDay(e.target.value)} style={{ ...sel, flex: 0.8 }}>
          <option value="">Jour</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={month} onChange={e => { setMonth(e.target.value); setDay(""); }} style={{ ...sel, flex: 1.4 }}>
          <option value="">Mois</option>
          {MOIS.map((m, i) => <option key={m} value={String(i+1).padStart(2,"0")}>{m}</option>)}
        </select>
        <select value={year} onChange={e => { setYear(e.target.value); setDay(""); }} style={{ ...sel, flex: 1 }}>
          <option value="">Année</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {year && month && day && (
        <div style={{ fontSize: 12, color: C.green, marginTop: 4, fontWeight: 600 }}>
          ✓ {day} {MOIS[Number(month)-1]} {year}
        </div>
      )}
    </div>
  );
}


// ─── Données inscription ──────────────────────────────────────
const PROFILS_INSCRIPTION = [
  { id: "souffrance", color: "#8B6FC6", bg: "#EDE8F8", label: "Personne en souffrance", desc: "Je vis avec des difficultés de santé mentale" },
  { id: "proche", color: "#7BBF9A", bg: "#E4F5EC", label: "Proche d'une personne en souffrance", desc: "J'accompagne un proche dans sa difficulté" },
  { id: "ami", color: "#F4A261", bg: "#FEF0E4", label: "Ami·e qui vient soutenir", desc: "Je veux aider un·e ami·e en souffrance" },
  { id: "specialiste", color: "#E891B0", bg: "#FDEAF2", label: "Professionnel de santé mentale", desc: "Je suis un professionnel du secteur psy" },
  { id: "visiteur", color: "#7090B0", bg: "#E8EEF8", label: "Visiteur·trice", desc: "Je découvre l'application" },
  { id: "modo", color: "#2060A0", bg: "#E0EAF8", label: "Modérateur·trice", desc: "J'ai un code d'accès modérateur" },
];

const MALADIES_LIST = ["Dépression", "Anxiété généralisée", "Trouble bipolaire", "Schizophrénie", "TOC", "PTSD", "Trouble borderline", "Troubles alimentaires", "Phobie sociale", "TDAH", "Autisme"];
const LIENS_PARENTE = ["Parent", "Enfant", "Conjoint·e", "Frère / Sœur", "Grand-parent", "Ami·e proche", "Tuteur·trice", "Autre"];
const PROFESSIONS_SANTE = ["Psychiatre", "Psychologue", "Psychothérapeute", "Infirmier·ère", "Médecin généraliste", "Éducateur·trice spécialisé·e", "Assistant·e social·e", "Pair-aidant·e", "Autre"];

function RegisterScreen({ onRegister, onGoLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [profil, setProfil] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [maladies, setMaladies] = useState([]);
  const [maladieFree, setMaladieFree] = useState("");
  const [lienParente, setLienParente] = useState("");
  const [profession, setProfession] = useState("");
  const [codeMode, setCodeMode] = useState("");

  const profilObj = PROFILS_INSCRIPTION.find(p => p.id === profil);
  const toggleMaladie = (m) => setMaladies(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!email.trim() || !email.includes("@")) { setError("Email invalide."); return; }
      if (password.length < 6) { setError("Mot de passe trop court (6 min)."); return; }
      if (password !== confirmPass) { setError("Les mots de passe ne correspondent pas."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!profil) { setError("Choisis un profil."); return; }
      setStep(3);
    }
  };

  const handleRegister = async () => {
    if (!genre) { setError("Choisis ton genre."); return; }
    if (!prenom.trim()) { setError("Entre ton prénom."); return; }
    if (!nom.trim()) { setError("Entre ton nom."); return; }
    if (!dateNaissance) { setError("Entre ta date de naissance."); return; }
    if (!ville.trim()) { setError("Entre ta ville."); return; }
    if (!codePostal.trim()) { setError("Entre ton code postal."); return; }
    if (profil === "modo" && codeMode !== "12345678") { setError("Code modérateur incorrect."); return; }
    setLoading(true);
    try {
      const metadata = { prenom, nom, genre, dateNaissance, ville, codePostal, profil,
        maladies: profil === "souffrance" ? [...maladies, maladieFree].filter(Boolean) : [],
        lienParente: profil === "proche" ? lienParente : "",
        profession: profil === "specialiste" ? profession : "",
        isModo: profil === "modo" };
      const data = await supabase.signUp(email.trim(), password, metadata);
      if (data.error) {
        setError(data.error.message === "User already registered" ? "Cet email est déjà utilisé." : "Erreur lors de la création du compte.");
        setLoading(false); return;
      }
      onRegister({ id: data.user?.id, email: email.toLowerCase(), prenom, nom, genre, dateNaissance, ville, codePostal, profil, isModo: profil === "modo", token: data.session?.access_token, coins: 0 });
      setLoading(false);
    } catch(e) { setError("Erreur de connexion."); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ background: profilObj ? "linear-gradient(135deg, " + profilObj.color + ", " + profilObj.color + "99)" : "linear-gradient(135deg, " + C.purple + ", " + C.purpleLight + ")", padding: "40px 24px 24px", transition: "background 0.4s" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "#fff" : "rgba(255,255,255,0.3)" }} />)}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Étape {step}/3</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 4 }}>
          {["Créer ton compte", "Ton profil", "Tes informations"][step-1]}
        </div>
      </div>

      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        {error && <div style={{ background: "#FEE2E2", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#E05A5A", fontWeight: 600 }}>⚠️ {error}</div>}

        {step === 1 && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Email <span style={{ color: "#E05A5A" }}>*</span></label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="ton@email.com"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Mot de passe <span style={{ color: "#E05A5A" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? "text" : "password"} placeholder="6 caractères minimum"
                  style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Confirme le mot de passe <span style={{ color: "#E05A5A" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} type={showPass ? "text" : "password"} placeholder="••••••••"
                  style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Ces informations sont visibles uniquement par les modérateurs.</div>
            {PROFILS_INSCRIPTION.map(p => (
              <button key={p.id} onClick={() => setProfil(p.id)}
                style={{ padding: "14px 16px", borderRadius: 16, border: profil === p.id ? "2px solid " + p.color : "2px solid " + C.border, background: profil === p.id ? p.bg : "#fff", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <>
            <div style={{ background: "#FEF9E4", borderRadius: 12, padding: "10px 14px", marginBottom: 12, border: "1px solid " + C.yellow + "66" }}>
              <div style={{ fontSize: 12, color: "#795548" }}>Les champs <span style={{ color: "#E05A5A", fontWeight: 700 }}>*</span> sont obligatoires. Tes informations sont privées.</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 8 }}>Genre <span style={{ color: "#E05A5A" }}>*</span></label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Homme", "Femme", "Non-binaire", "Préfère ne pas dire"].map(g => (
                  <button key={g} onClick={() => setGenre(g)}
                    style={{ padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: genre === g ? "2px solid " + C.purple : "2px solid " + C.border, background: genre === g ? C.purplePale : "#fff", cursor: "pointer", color: C.text }}>{g}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{label:"Prénom",val:prenom,set:setPrenom,ph:"Ton prénom"},{label:"Nom",val:nom,set:setNom,ph:"Ton nom"}].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>{f.label} <span style={{ color: "#E05A5A" }}>*</span></label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
              ))}
            </div>
            <DateSelecteur value={dateNaissance} onChange={setDateNaissance} />
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Ville <span style={{ color: "#E05A5A" }}>*</span></label>
                <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ta ville"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Code postal <span style={{ color: "#E05A5A" }}>*</span></label>
                <input value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="75001" maxLength={5}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            </div>
            {profil === "souffrance" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 8 }}>Pathologie(s) (optionnel)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {MALADIES_LIST.map(m => (
                    <button key={m} onClick={() => toggleMaladie(m)}
                      style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: maladies.includes(m) ? "2px solid " + C.purple : "2px solid " + C.border, background: maladies.includes(m) ? C.purplePale : "#fff", cursor: "pointer", color: C.text }}>{m}</button>
                  ))}
                </div>
                <input value={maladieFree} onChange={e => setMaladieFree(e.target.value)} placeholder="Autre..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 13, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            )}
            {profil === "proche" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Lien de parenté</label>
                <select value={lienParente} onChange={e => setLienParente(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit", color: C.text }}>
                  <option value="">— Sélectionner —</option>
                  {LIENS_PARENTE.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
            {profil === "specialiste" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Profession</label>
                <select value={profession} onChange={e => setProfession(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit", color: C.text }}>
                  <option value="">— Sélectionner —</option>
                  {PROFESSIONS_SANTE.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            {profil === "modo" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 5 }}>Code modérateur <span style={{ color: "#E05A5A" }}>*</span></label>
                <input value={codeMode} onChange={e => setCodeMode(e.target.value.replace(/[^0-9]/g, "").slice(0,8))} type="password" placeholder="••••••••" maxLength={8}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14, border: "1px solid " + C.border, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit", letterSpacing: 4 }} />
              </div>
            )}
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {step > 1 && (
            <button onClick={() => { setStep(s => s-1); setError(""); }}
              style={{ padding: "14px 20px", borderRadius: 50, background: C.border, color: C.muted, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              ← Retour
            </button>
          )}
          {step < 3 ? (
            <button onClick={nextStep}
              style={{ flex: 1, padding: 14, borderRadius: 50, background: profilObj ? profilObj.color : C.purple, color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Continuer →
            </button>
          ) : (
            <button onClick={handleRegister} disabled={loading}
              style={{ flex: 1, padding: 14, borderRadius: 50, background: loading ? C.muted : (profilObj ? profilObj.color : C.purple), color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer" }}>
              {loading ? "Création..." : "Créer mon compte 💜"}
            </button>
          )}
        </div>
        {step === 1 && (
          <div style={{ textAlign: "center", fontSize: 14, color: C.muted }}>
            Déjà un compte ?{" "}
            <span onClick={onGoLogin} style={{ color: C.purple, fontWeight: 700, cursor: "pointer" }}>Se connecter</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Heidi({ user, onLogout }) {
  const [screen, setScreen] = useState(S.HOME);
  const [chatContact, setChatContact] = useState(null);
  const [fiche, setFiche] = useState(null);
  const [coins, setCoins] = useState(user.coins || 45);
  const [quests, setQuests] = useState(QUESTS);
  const [mode, setMode] = useState(user.mode || "Mode libre");

  const [currentAvatar, setCurrentAvatar] = useState("calme");

  const addCoins = async (n) => {
    const newTotal = coins + n;
    setCoins(newTotal);
    // Save to localStorage as backup
    if (user) {
      const saved = JSON.parse(localStorage.getItem("mb_current_user") || "{}");
      localStorage.setItem("mb_current_user", JSON.stringify({...saved, coins: newTotal}));
    }
  };
  const spendCoins = (n) => setCoins(c => Math.max(0, c - n));

  const noNav = [S.CHAT_ROOM];

  if (screen === S.CHAT_ROOM) return <ChatRoomScreen onBack={() => setScreen(S.CHAT)} contact={chatContact} user={user} />;

  const NAV_ITEMS = [
    { label: "Accueil", s: S.HOME, svg: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
    { label: "Quêtes", s: S.QUESTS, svg: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></> },
    { label: "Chat", s: S.CHAT, svg: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/> },
    { label: "Ressources", s: S.RESOURCES, svg: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></> },
  ];

  const mainScreens = [S.HOME, S.QUESTS, S.CHAT, S.RESOURCES];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        {screen === S.HOME && <HomeScreen setScreen={setScreen} quests={quests} coins={coins} user={user} currentAvatar={currentAvatar} setCurrentAvatar={setCurrentAvatar} />}
        {screen === S.QUESTS && <QuestsScreen onBack={() => setScreen(S.HOME)} quests={quests} setQuests={setQuests} addCoins={addCoins} mode={mode} />}
        {screen === S.GAME && <GameScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} />}
        {screen === S.BREATHE    && <BreatheScreen    onBack={() => setScreen(S.GAME)} />}
        {screen === S.SCAN       && <ScanScreen       onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.JOURNAL    && <JournalScreen    onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.GRATITUDE  && <GratitudeScreen  onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.COGNITIF   && <CognitifScreen   onBack={() => setScreen(S.GAME)} addCoins={addCoins} />}
        {screen === S.COMMUNAUTE && <CommunauteScreen onBack={() => setScreen(S.HOME)} user={user} />}
        {screen === S.HUMEUR     && <SuiviHumeurScreen onBack={() => setScreen(S.HOME)} user={user} />}
        {screen === S.URGENCES   && <UrgencesScreen   onBack={() => setScreen(S.HOME)} />}
        {screen === S.RAPPELS    && <RappelsScreen    onBack={() => setScreen(S.HOME)} />}
        {screen === S.CHAT && <ChatScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} setChatContact={setChatContact} />}
        {screen === S.LIVE && <LiveScreen onBack={() => setScreen(S.HOME)} />}
        {screen === S.RESOURCES && <ResourcesScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} setFiche={setFiche} />}
        {screen === S.FICHE && <FicheScreen onBack={() => setScreen(S.RESOURCES)} fiche={fiche} />}
        {screen === S.PROFILE && <ProfileScreen onBack={() => setScreen(S.HOME)} coins={coins} quests={quests} mode={mode} setMode={setMode} user={user} onLogout={onLogout} />}
      </div>

      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.bgCard, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 16px" }}>
        {NAV_ITEMS.map(item => (
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
  if (authState === "app") return <Heidi user={currentUser} onLogout={handleLogout} />;

  return null;
}
