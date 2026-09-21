/* The District — public creator showcase */
let DISTRICT_CREATORS = [];

function esc(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}
function safeUrl(value) {
    try {
        const url = new URL(String(value || "").trim(), window.location.href);
        return ["http:","https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
}
function initials(name) {
    return String(name || "Creator").trim().split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join("").toUpperCase() || "CR";
}
function avatar(c) {
    const url=safeUrl(c.avatar);
    return url
        ? `<span class="creator-avatar"><img src="${esc(url)}" alt="${esc(c.name || "Creator")}" loading="lazy"></span>`
        : `<span class="creator-avatar">${esc(initials(c.name))}</span>`;
}
function link(c) {
    const url=safeUrl(c.channelUrl);
    return url ? {href:esc(url),attrs:'target="_blank" rel="noopener noreferrer"'} : {href:"#",attrs:'aria-disabled="true" onclick="return false;"'};
}
function liveCard(c) {
    const l=link(c);
    const thumb=safeUrl(c.thumbnail);
    const tags=Array.isArray(c.tags) ? c.tags.slice(0,4).map(tag=>`<span>${esc(tag)}</span>`).join("") : "";
    return `<article class="creator-live-card">
        <a class="creator-live-preview" href="${l.href}" ${l.attrs}>
            ${thumb ? `<img src="${esc(thumb)}" alt="${esc(c.name || "Creator")} stream preview" loading="lazy">` : ""}
            <span class="creator-live-pill">● LIVE</span>
            <span class="creator-live-viewers">${Number.isFinite(Number(c.viewers)) ? Number(c.viewers).toLocaleString()+" watching" : "Live now"}</span>
        </a>
        <div class="creator-live-body">
            <div class="creator-live-identity">
                ${avatar(c)}
                <div class="creator-live-name"><strong>${esc(c.name || "Creator")}</strong><span>${esc(c.statusLine || c.handle || "Live in The District")}</span></div>
                <span class="creator-platform-badge">${esc(c.platform || "Live")}</span>
            </div>
            ${tags ? `<div class="creator-live-tags">${tags}</div>` : ""}
        </div>
        <a class="creator-live-link" href="${l.href}" ${l.attrs}><span>Watch stream</span><span>→</span></a>
    </article>`;
}
function rosterCard(c) {
    const l=link(c);
    const live=c.live===true;
    return `<article class="creator-roster-card">
        <div class="creator-roster-top">
            ${avatar(c)}
            <div class="creator-roster-info"><strong>${esc(c.name || "Creator")}</strong><span>${esc(c.platform || "Creator")}</span></div>
            <span class="creator-roster-status ${live ? "live" : ""}">${live ? "● LIVE" : "OFFLINE"}</span>
        </div>
        <div class="creator-roster-bottom">
            <span class="creator-roster-handle">${esc(c.handle || c.statusLine || "The District Creator")}</span>
            <a class="creator-roster-link" href="${l.href}" ${l.attrs}>View channel →</a>
        </div>
    </article>`;
}
function emptyLive() {
    return `<div class="creator-empty-state"><div><div class="creator-empty-icon">LIVE STATUS</div><h3>Nobody is live right now.</h3><p>When a District creator goes live, they will appear here automatically.</p></div></div>`;
}
function emptyRoster(message="The creator roster is being built.") {
    return `<div class="creator-empty-state"><div><div class="creator-empty-icon">CREATORS</div><h3>${esc(message)}</h3><p>Creator profiles will appear here as the community roster is updated.</p></div></div>`;
}
function render() {
    const creators=Array.isArray(DISTRICT_CREATORS) ? DISTRICT_CREATORS : [];
    const live=creators.filter(c=>c && c.live===true);
    const liveTarget=document.getElementById("liveCreators");
    const rosterTarget=document.getElementById("creatorRosterGrid");
    const liveCount=document.getElementById("liveCreatorCount");
    const totalCount=document.getElementById("totalCreatorCount");
    if(liveCount) liveCount.textContent=String(live.length);
    if(totalCount) totalCount.textContent=String(creators.length);
    if(liveTarget) liveTarget.innerHTML=live.length ? live.map(liveCard).join("") : emptyLive();
    if(rosterTarget) rosterTarget.innerHTML=creators.length ? creators.map(rosterCard).join("") : emptyRoster();
}
async function loadCreators() {
    try {
        const response=await fetch("/api/creators",{cache:"no-store"});
        const data=await response.json();
        if(!response.ok || !data.success) throw new Error(data.error || "Creator roster unavailable");
        DISTRICT_CREATORS=Array.isArray(data.creators) ? data.creators : [];
        render();
    } catch(error) {
        console.warn("Creator roster unavailable:",error);
        render();
    }
}
document.addEventListener("DOMContentLoaded",()=>{
    render();
    loadCreators();
    window.setInterval(()=>{ if(document.visibilityState==="visible") loadCreators(); },60000);
});