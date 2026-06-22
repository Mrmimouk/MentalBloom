import { useState, useEffect, useRef } from "react";

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
  HOME: "home", AVATAR: "avatar", HOUSE: "house",
  QUESTS: "quests", GAME: "game", BREATHE: "breathe",
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

// ─── Avatar config ────────────────────────────────────────────
const AVATAR_COLORS = ["#C4AEE8", "#A8D8B9", "#F4B8D0", "#F9D89A", "#A8C8E8"];
const AVATAR_TOPS = ["👒", "🎩", "🪖", "⛑️", "🎓", "✨"];
const AVATAR_ACCS = ["🌸", "⭐", "🌈", "🦋", "🍀", "💜"];

// ─── House items ──────────────────────────────────────────────
const SHOP_ITEMS = [
  { id: "plant", icon: "🪴", name: "Plante verte", cost: 20, category: "deco" },
  { id: "lamp", icon: "🪔", name: "Lampe douce", cost: 30, category: "deco" },
  { id: "book", icon: "📚", name: "Étagère de livres", cost: 40, category: "meubles" },
  { id: "sofa", icon: "🛋️", name: "Canapé confort", cost: 60, category: "meubles" },
  { id: "cat", icon: "🐱", name: "Chat câlin", cost: 80, category: "compagnon" },
  { id: "star", icon: "⭐", name: "Étoile filante", cost: 50, category: "deco" },
  { id: "rainbow", icon: "🌈", name: "Arc-en-ciel", cost: 45, category: "deco" },
  { id: "music", icon: "🎵", name: "Boîte à musique", cost: 35, category: "deco" },
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

function HomeScreen({ setScreen, quests, coins, avatar }) {
  const done = quests.filter(q => q.done).length;
  return (
    <div style={{ padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Bonjour 🌸</div>
          <div style={{ fontSize: 13, color: C.muted }}>Comment tu vas aujourd'hui ?</div>
        </div>
        <button onClick={() => setScreen(S.PROFILE)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatar.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 2px 8px ${avatar.color}66` }}>
            {avatar.top}
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

      {/* Ma maison */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Card onClick={() => setScreen(S.HOUSE)} style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 32 }}>🏡</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginTop: 4 }}>Ma maison</div>
        </Card>
        <Card onClick={() => setScreen(S.AVATAR)} style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 32 }}>👤</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginTop: 4 }}>Mon avatar</div>
        </Card>
        <Card onClick={() => setScreen(S.LIVE)} style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 32 }}>🎙️</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginTop: 4 }}>Lives</div>
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

function AvatarScreen({ onBack, avatar, setAvatar, coins, spendCoins }) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Mon avatar 👤</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Personnalise ton petit personnage</div>

      {/* Preview */}
      <Card style={{ textAlign: "center", padding: 32, marginBottom: 20, background: `linear-gradient(135deg, ${C.purplePale}, ${C.greenPale})`, border: "none" }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: avatar.color, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: `0 4px 20px ${avatar.color}88` }}>
          {avatar.top}
        </div>
        <div style={{ fontSize: 24, marginTop: 8 }}>{avatar.acc}</div>
        <div style={{ fontWeight: 700, color: C.text, marginTop: 4 }}>Ton avatar</div>
      </Card>

      <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Couleur</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {AVATAR_COLORS.map(c => (
          <button key={c} onClick={() => setAvatar(a => ({ ...a, color: c }))} style={{ width: 38, height: 38, borderRadius: "50%", background: c, border: avatar.color === c ? `3px solid ${C.purple}` : "3px solid transparent", cursor: "pointer" }} />
        ))}
      </div>

      <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Chapeau / coiffure</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {AVATAR_TOPS.map(t => (
          <button key={t} onClick={() => setAvatar(a => ({ ...a, top: t }))} style={{ width: 44, height: 44, borderRadius: 12, background: avatar.top === t ? C.purplePale : C.bg, border: avatar.top === t ? `2px solid ${C.purple}` : `2px solid ${C.border}`, fontSize: 22, cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Accessoire</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {AVATAR_ACCS.map(a => (
          <button key={a} onClick={() => setAvatar(av => ({ ...av, acc: a }))} style={{ width: 44, height: 44, borderRadius: 12, background: avatar.acc === a ? C.purplePale : C.bg, border: avatar.acc === a ? `2px solid ${C.purple}` : `2px solid ${C.border}`, fontSize: 22, cursor: "pointer" }}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function HouseScreen({ onBack, house, setHouse, coins, spendCoins }) {
  const [tab, setTab] = useState("maison");
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Ma maison 🏡</div>
        <div style={{ fontWeight: 700, color: C.purple }}>🪙 {coins}</div>
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Décore ton espace avec tes PsychoCoins</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["maison", "boutique"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", background: tab === t ? C.purple : C.border, color: tab === t ? "#fff" : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {t === "maison" ? "Ma maison" : "Boutique"}
          </button>
        ))}
      </div>

      {tab === "maison" && (
        <>
          <Card style={{ background: `linear-gradient(135deg, #E8F4E8, #F4E8F8)`, border: "none", minHeight: 200, textAlign: "center", padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {house.map(id => {
                const item = SHOP_ITEMS.find(i => i.id === id);
                return item ? <span key={id} style={{ fontSize: 32 }}>{item.icon}</span> : null;
              })}
              {house.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Ta maison est vide… visite la boutique ! 🛍️</div>}
            </div>
          </Card>
        </>
      )}

      {tab === "boutique" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SHOP_ITEMS.map(item => {
            const owned = house.includes(item.id);
            const canBuy = coins >= item.cost && !owned;
            return (
              <Card key={item.id} style={{ textAlign: "center", padding: 14, opacity: owned ? 0.6 : 1 }}>
                <div style={{ fontSize: 36 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginTop: 6 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>🪙 {item.cost}</div>
                {owned
                  ? <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginTop: 6 }}>✓ Possédé</div>
                  : <Btn small onClick={() => { if (canBuy) { spendCoins(item.cost); setHouse(h => [...h, item.id]); } }} color={canBuy ? C.purple : C.muted} style={{ marginTop: 8, padding: "6px 14px", fontSize: 12 }}>Acheter</Btn>
                }
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GameScreen({ onBack, setScreen }) {
  const games = [
    { icon: "🌬️", title: "Respiration guidée", desc: "Technique 4-4-6 pour calmer l'anxiété", s: S.BREATHE, color: C.purple, ready: true },
    { icon: "🌿", title: "Scan corporel", desc: "Reconnecte-toi à ton corps", s: null, color: C.green, ready: false },
    { icon: "📓", title: "Journal des émotions", desc: "Pose tes pensées, observe tes humeurs", s: null, color: C.orange, ready: false },
    { icon: "🌟", title: "Gratitude du jour", desc: "3 choses positives d'aujourd'hui", s: null, color: C.yellow, ready: false },
    { icon: "🧩", title: "Défis cognitifs doux", desc: "Stimule ton esprit en douceur", s: null, color: C.pink, ready: false },
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
          <Card key={c.id} onClick={() => { setChatContact(c); setScreen(S.CHAT_ROOM); }} style={{ display: "flex", alignItems: "center", gap: 14, opacity: c.available ? 1 : 0.5 }}>
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

function ChatRoomScreen({ onBack, contact }) {
  const [msgs, setMsgs] = useState([{ from: "them", text: `Bonjour, je suis ${contact.name}. Comment puis-je vous aider aujourd'hui ?` }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { from: "me", text: input }]);
    setInput("");
    setTimeout(() => setMsgs(m => [...m, { from: "them", text: "Merci de partager ça avec moi. Je vous écoute. Pouvez-vous m'en dire un peu plus ?" }]), 1500);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, background: C.bgCard }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.purple, fontWeight: 700, fontSize: 18, cursor: "pointer" }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: contact.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>{contact.name[0]}</div>
        <div>
          <div style={{ fontWeight: 700, color: C.text }}>{contact.name}</div>
          <div style={{ fontSize: 12, color: C.green }}>{contact.role}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.from === "me" ? C.purple : C.bgCard, color: m.from === "me" ? "#fff" : C.text, fontSize: 14, border: m.from !== "me" ? `1px solid ${C.border}` : "none" }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, background: C.bgCard }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Écrivez votre message…" style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, background: C.bg }} />
        <Btn onClick={send} style={{ padding: "10px 18px", borderRadius: 24, margin: 0 }}>↑</Btn>
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

function ProfileScreen({ onBack, coins, quests, avatar, mode, setMode }) {
  const done = quests.filter(q => q.done).length;
  const modes = ["Mode libre", "Mode accompagné", "Mode engagement"];
  return (
    <div style={{ padding: "20px 16px" }}>
      <BackBtn onBack={onBack} />
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 20 }}>Mon profil</div>
      <Card style={{ textAlign: "center", padding: 24, marginBottom: 16, background: `linear-gradient(135deg, ${C.purplePale}, ${C.greenPale})`, border: "none" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: avatar.color, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
          {avatar.top}
        </div>
        <div style={{ fontSize: 24, marginTop: 4 }}>{avatar.acc}</div>
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
export default function MentalBloom() {
  const [screen, setScreen] = useState(S.HOME);
  const [chatContact, setChatContact] = useState(null);
  const [fiche, setFiche] = useState(null);
  const [coins, setCoins] = useState(45);
  const [quests, setQuests] = useState(QUESTS);
  const [house, setHouse] = useState(["plant"]);
  const [avatar, setAvatar] = useState({ color: AVATAR_COLORS[0], top: AVATAR_TOPS[0], acc: AVATAR_ACCS[0] });
  const [mode, setMode] = useState("Mode libre");

  const addCoins = (n) => setCoins(c => c + n);
  const spendCoins = (n) => setCoins(c => Math.max(0, c - n));

  const noNav = [S.CHAT_ROOM];

  if (screen === S.CHAT_ROOM) return <ChatRoomScreen onBack={() => setScreen(S.CHAT)} contact={chatContact} />;

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
        {screen === S.HOME && <HomeScreen setScreen={setScreen} quests={quests} coins={coins} avatar={avatar} />}
        {screen === S.QUESTS && <QuestsScreen onBack={() => setScreen(S.HOME)} quests={quests} setQuests={setQuests} addCoins={addCoins} mode={mode} />}
        {screen === S.AVATAR && <AvatarScreen onBack={() => setScreen(S.HOME)} avatar={avatar} setAvatar={setAvatar} coins={coins} spendCoins={spendCoins} />}
        {screen === S.HOUSE && <HouseScreen onBack={() => setScreen(S.HOME)} house={house} setHouse={setHouse} coins={coins} spendCoins={spendCoins} />}
        {screen === S.GAME && <GameScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} />}
        {screen === S.BREATHE && <BreatheScreen onBack={() => setScreen(S.GAME)} />}
        {screen === S.CHAT && <ChatScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} setChatContact={setChatContact} />}
        {screen === S.LIVE && <LiveScreen onBack={() => setScreen(S.HOME)} />}
        {screen === S.RESOURCES && <ResourcesScreen onBack={() => setScreen(S.HOME)} setScreen={setScreen} setFiche={setFiche} />}
        {screen === S.FICHE && <FicheScreen onBack={() => setScreen(S.RESOURCES)} fiche={fiche} />}
        {screen === S.PROFILE && <ProfileScreen onBack={() => setScreen(S.HOME)} coins={coins} quests={quests} avatar={avatar} mode={mode} setMode={setMode} />}
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
