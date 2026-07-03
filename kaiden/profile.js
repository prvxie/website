/* ============================================================
   alternate.lol V10 — profile.js — Complete Profile Engine
   ============================================================ */
(function () {
    'use strict';

    // ── Load config ──────────────────────────────────────────
    const key = window.location.pathname.includes('kaiden') ? 'kaiden' : 'koni';
    const configName = key.charAt(0).toUpperCase() + key.slice(1) + 'Config';
    let cfg = window[configName] || window.KoniConfig || {};
    const isPreview = window.self !== window.top || window.location.search.includes('preview=true');

    let initialized = false;
    if (isPreview) {
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'updateConfig') {
                cfg = e.data.config;
                if (!initialized) {
                    initialized = true;
                    startProfile();
                }
            }
        });
        
        // Try reading from localStorage as fallback
        try {
            const previewKey = key + 'PreviewConfig';
            const s = localStorage.getItem(previewKey);
            if (s) {
                cfg = Object.assign({}, cfg, JSON.parse(s));
                initialized = true;
                startProfile();
            }
        } catch(e){}
        
        // Safety timeout to start anyway if no postMessage is received
        setTimeout(() => {
            if (!initialized) {
                initialized = true;
                startProfile();
            }
        }, 350);
    } else {
        initialized = true;
        startProfile();
    }

    function startProfile() {

    // ── Password Check ──
    if (cfg.passwordEnabled && cfg.password) {
        const pinScreen = document.createElement('div');
        pinScreen.id = 'pin-lock-screen';
        pinScreen.style.cssText = 'position:fixed;inset:0;background:#000;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;';
        pinScreen.innerHTML = `
            <div style="text-align:center;padding:20px;max-width:320px;width:100%;">
                <h2 style="margin-bottom:10px;"><i class="fas fa-lock" style="color:#ff00ff;text-shadow:0 0 10px #ff00ff;"></i> Secure Profile</h2>
                <p style="color:#888;font-size:0.85rem;margin-bottom:20px;">\${cfg.passwordMsg || 'This profile is password protected.'}</p>
                <input type="password" id="pin-input" placeholder="Enter PIN/Password" style="width:100%;padding:12px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;text-align:center;font-size:1.1rem;margin-bottom:12px;outline:none;box-sizing:border-box;">
                <button id="pin-submit" style="width:100%;padding:12px;border:none;border-radius:8px;background:#fff;color:#000;font-weight:600;cursor:pointer;font-size:0.95rem;">Unlock Profile</button>
                <div id="pin-error" style="color:#ff4444;font-size:0.8rem;margin-top:10px;display:none;">Incorrect Password!</div>
            </div>
        `;
        document.body.appendChild(pinScreen);
        
        const pinInput = pinScreen.querySelector('#pin-input');
        const pinSubmit = pinScreen.querySelector('#pin-submit');
        const pinError = pinScreen.querySelector('#pin-error');
        
        function tryUnlock() {
            if (pinInput.value === cfg.password) {
                pinScreen.remove();
                document.body.style.overflow = '';
            } else {
                pinError.style.display = 'block';
                pinInput.value = '';
                pinInput.focus();
            }
        }
        pinSubmit.addEventListener('click', tryUnlock);
        pinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
        
        document.body.style.overflow = 'hidden';
    }

    const $ = id => document.getElementById(id);
    const R = document.documentElement;
    const c = cfg.colors || {};

    // ── Helpers ───────────────────────────────────────────────
    function hr(hex, a) {
        if (!hex || hex[0] !== '#') return `rgba(0,0,0,${a})`;
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }
    function g(obj, path, fb) { return path.split('.').reduce((o,k) => o&&o[k]!==undefined?o[k]:fb, obj); }
    function drawRoundRect(ctx, x, y, w, h, r) {
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, w, h);
        }
    }

    // ─────────────────────────────────────────────────────────
    // 1. FONTS
    // ─────────────────────────────────────────────────────────
    if (cfg.fontFamily === 'custom' && cfg.customFontUrl) {
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = cfg.customFontUrl;
        document.head.appendChild(l);
        R.style.setProperty('--font', cfg.customFontName || "'Space Grotesk',sans-serif");
    } else {
        R.style.setProperty('--font', cfg.fontFamily || "'Space Grotesk',sans-serif");
    }
    R.style.setProperty('--fw', cfg.fontWeight || '600');
    R.style.setProperty('--fscale', (cfg.fontSize || 100) / 100);

    // ─────────────────────────────────────────────────────────
    // 2. COLORS
    // ─────────────────────────────────────────────────────────
    R.style.setProperty('--bg', c.bg || '#000');
    R.style.setProperty('--card-bg', hr(c.cardBg || '#0f0f0f', c.cardBgOpacity !== undefined ? c.cardBgOpacity : .6));
    R.style.setProperty('--text', c.textPrimary || '#fff');
    R.style.setProperty('--text2', c.textSecondary || '#a0a0a0');
    R.style.setProperty('--accent', c.accent || '#fff');
    R.style.setProperty('--social-color', c.socialIcon || '#fff');
    R.style.setProperty('--social-hover', c.socialIconHover || '#f0f');
    R.style.setProperty('--btn-hover-bg', c.linkHoverBg || '#fff');
    R.style.setProperty('--btn-hover-color', c.bg || '#000');

    // ─────────────────────────────────────────────────────────
    // 3. CARD CSS VARS
    // ─────────────────────────────────────────────────────────
    const card = cfg.card || {};
    R.style.setProperty('--card-blur', (card.blur || 15) + 'px');
    R.style.setProperty('--card-radius', (card.borderRadius || 20) + 'px');
    R.style.setProperty('--card-border-width', (card.borderWidth || 1) + 'px');
    R.style.setProperty('--card-border', card.borderColor || 'rgba(255,255,255,.1)');
    R.style.setProperty('--card-shadow', card.shadowColor || 'rgba(0,0,0,.5)');
    R.style.setProperty('--card-shadow-blur', (card.shadowBlur || 50) + 'px');
    R.style.setProperty('--card-width', (cfg.cardWidth || 450) + 'px');
    R.style.setProperty('--card-padding', (cfg.cardPadding || 48) + 'px');
    R.style.setProperty('--avatar-size', (cfg.avatarSize || 120) + 'px');
    R.style.setProperty('--social-size', (cfg.socialSize || 24) + 'px');
    R.style.setProperty('--social-gap', (cfg.socialGap || 24) + 'px');
    R.style.setProperty('--btn-radius', (g(cfg,'buttons.borderRadius',10)) + 'px');
    R.style.setProperty('--banner-height', (cfg.bannerHeight || 120) + 'px');
    R.style.setProperty('--widget-align', g(cfg, 'widgets.align', 'center'));

    // ─────────────────────────────────────────────────────────
    // 4. BUTTONS
    // ─────────────────────────────────────────────────────────
    const bt = cfg.buttons || {};
    R.style.setProperty('--btn-bg', hr(bt.bg || '#000', parseFloat(bt.bgOpacity || .3)));
    R.style.setProperty('--btn-border', bt.border ? `1px solid ${bt.borderColor || 'rgba(255,255,255,.1)'}` : 'none');
    R.style.setProperty('--btn-color', bt.textColor || '#fff');

    // ─────────────────────────────────────────────────────────
    // 5. WRAPPER POSITION
    // ─────────────────────────────────────────────────────────
    const wrap = $('profile-wrapper');
    if (cfg.cardPositionH === 'left') wrap.classList.add('align-left');
    else if (cfg.cardPositionH === 'right') wrap.classList.add('align-right');
    if (cfg.cardPositionV === 'top') wrap.classList.add('align-top');
    else if (cfg.cardPositionV === 'bottom') wrap.classList.add('align-bottom');

    // ─────────────────────────────────────────────────────────
    // 6. CARD ELEMENT
    // ─────────────────────────────────────────────────────────
    const cardEl = document.querySelector('.card');

    // Card Layout
    const layout = cfg.cardLayout || 'default';
    if (layout !== 'default') cardEl.classList.add('layout-' + layout);
    if ((cfg.widgets || {}).transparent) cardEl.classList.add('widgets-transparent');

    // Banner
    if ((layout === 'banner' || cfg.bannerUrl) && cfg.bannerUrl) {
        const banner = document.createElement('img');
        banner.className = 'card-banner'; banner.src = cfg.bannerUrl; banner.alt = '';
        cardEl.insertBefore(banner, cardEl.firstChild);
    }

    // Entrance
    if (card.animation && card.animation !== 'none') cardEl.classList.add('anim-' + card.animation);

    // Border style
    const bs = card.borderStyle || 'solid';
    if (bs === 'rgb') cardEl.classList.add('border-rgb');
    else if (bs === 'neon') cardEl.classList.add('border-neon');
    else if (bs === 'double') cardEl.classList.add('border-double');
    else if (bs === 'none') cardEl.style.border = 'none';

    // ─────────────────────────────────────────────────────────
    // 7. AVATAR
    // ─────────────────────────────────────────────────────────
    const aw = $('avatar-wrapper');
    $('profile-avatar').src = cfg.avatarUrl || '';
    const sh = cfg.avatarShape || 'circle';
    if (sh !== 'circle') aw.classList.add('avatar-' + sh);
    if (cfg.avatarEffect && cfg.avatarEffect !== 'none') aw.classList.add('avatar-effect-' + cfg.avatarEffect);
    if (cfg.avatarBorder && cfg.avatarBorder !== 'none') aw.classList.add('avatar-border-' + cfg.avatarBorder);
    if (cfg.avatarBorderColor) R.style.setProperty('--accent', cfg.avatarBorderColor);

    // ─────────────────────────────────────────────────────────
    // 8. USERNAME EFFECTS
    // ─────────────────────────────────────────────────────────
    const uEl = $('profile-username');
    const name = cfg.username || '';
    const ufx = cfg.usernameEffect || 'none';
    document.title = name || 'Profile';

    if (ufx === 'wavy') {
        uEl.classList.add('fx-wavy');
        uEl.innerHTML = name.split('').map((ch, i) =>
            `<span style="animation-delay:${i * .08}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
    } else if (ufx === 'shuffle') {
        uEl.textContent = name; shuffleText(uEl, name);
    } else if (ufx === 'typewriter') {
        uEl.classList.add('fx-typewriter'); uEl.textContent = name;
    } else {
        uEl.textContent = name;
        if (ufx !== 'none') uEl.classList.add('fx-' + ufx.replace('_','-').replace('neon-pulse','neon-pulse'));
    }

    // ─────────────────────────────────────────────────────────
    // 9. SUBTITLE & BIO
    // ─────────────────────────────────────────────────────────
    if (cfg.subtitle) $('profile-subtitle').textContent = cfg.subtitle;
    const bioEl = $('profile-bio');
    if (cfg.typewriterBio && cfg.bio) {
        let i = 0; const spd = cfg.typewriterSpeed || 50;
        bioEl.textContent = '';
        function type() { if (i < cfg.bio.length) { bioEl.textContent += cfg.bio[i++]; setTimeout(type, spd); } }
        setTimeout(type, 700);
    } else { bioEl.textContent = cfg.bio || ''; }

    // ─────────────────────────────────────────────────────────
    // 10. BADGES
    // ─────────────────────────────────────────────────────────
    const badgesEl = $('profile-badges');
    if (cfg.badge1 && cfg.badge1.text) badgesEl.innerHTML += `<span class="badge" style="color:${cfg.badge1.color};background:${cfg.badge1.bg}">${cfg.badge1.text}</span>`;
    if (cfg.badge2 && cfg.badge2.text) badgesEl.innerHTML += `<span class="badge" style="color:${cfg.badge2.color};background:${cfg.badge2.bg}">${cfg.badge2.text}</span>`;
    if (Array.isArray(cfg.customBadges)) {
        cfg.customBadges.forEach(b => {
            if (b && b.text) {
                badgesEl.innerHTML += `<span class="badge" style="color:${b.color || '#fff'};background:${b.bg || '#1a1a1a'}">${b.text}</span>`;
            }
        });
    }

    // ─────────────────────────────────────────────────────────
    // 11. ELEMENT ORDER & VISIBILITY
    // ─────────────────────────────────────────────────────────
    const elMap = { avatar:'el-avatar', username:'el-username', subtitle:'el-subtitle', bio:'el-bio', badges:'el-badges', socials:'el-socials', links:'el-links' };
    const visMap = { avatar: cfg.showAvatar !== false, username: cfg.showUsername !== false, subtitle: cfg.showSubtitle === true, bio: cfg.showBio !== false, badges: cfg.showBadges === true, socials: cfg.showSocials !== false, links: cfg.showLinks !== false };

    let contentCol = cardEl;
    if (layout === 'wide') {
        contentCol = document.createElement('div');
        contentCol.className = 'card-content-col';
    }

    (cfg.elementOrder || Object.keys(elMap)).forEach(k => {
        const el = $(elMap[k]); if (!el) return;
        el.style.display = visMap[k] ? '' : 'none';
        if (layout === 'wide' && k !== 'avatar') {
            contentCol.appendChild(el);
        } else {
            cardEl.appendChild(el);
        }
    });

    if (layout === 'wide') {
        cardEl.appendChild(contentCol);
    }

    // ─────────────────────────────────────────────────────────
    // 12. WIDGETS (view counter, pronouns, location, age, spotify, discord)
    // ─────────────────────────────────────────────────────────
    const wg = cfg.widgets || {};

    function insertWidget(el, pos) {
        if (layout === 'wide') {
            // For wide layout, everything goes into contentCol to stack vertically on the right
            if (pos === 'top' || pos === 'belowAvatar') {
                contentCol.insertBefore(el, contentCol.firstChild);
            } else if (pos === 'belowUsername') {
                const u = $('el-username');
                if (u && u.nextSibling) contentCol.insertBefore(el, u.nextSibling);
                else contentCol.appendChild(el);
            } else if (pos === 'belowBio') {
                const bio = $('el-bio');
                if (bio && bio.nextSibling) contentCol.insertBefore(el, bio.nextSibling);
                else contentCol.appendChild(el);
            } else if (pos === 'belowSocials') {
                const soc = $('el-socials');
                if (soc && soc.nextSibling) contentCol.insertBefore(el, soc.nextSibling);
                else contentCol.appendChild(el);
            } else {
                const linksEl = $('el-links');
                if (linksEl) contentCol.insertBefore(el, linksEl);
                else contentCol.appendChild(el);
            }
            return;
        }

        if (pos === 'top') {
            cardEl.insertBefore(el, cardEl.firstChild);
        } else if (pos === 'belowAvatar') {
            const av = $('el-avatar');
            if (av && av.nextSibling) cardEl.insertBefore(el, av.nextSibling);
            else cardEl.appendChild(el);
        } else if (pos === 'belowUsername') {
            const u = $('el-username');
            if (u && u.nextSibling) cardEl.insertBefore(el, u.nextSibling);
            else cardEl.appendChild(el);
        } else if (pos === 'belowBio') {
            const bio = $('el-bio');
            if (bio && bio.nextSibling) cardEl.insertBefore(el, bio.nextSibling);
            else cardEl.appendChild(el);
        } else if (pos === 'belowSocials') {
            const soc = $('el-socials');
            if (soc && soc.nextSibling) cardEl.insertBefore(el, soc.nextSibling);
            else cardEl.appendChild(el);
        } else {
            const linksEl = $('el-links');
            if (linksEl) cardEl.insertBefore(el, linksEl);
            else cardEl.appendChild(el);
        }
    }

    // View counter
    if (wg.viewCounter && wg.viewCounter.enabled) {
        const vcKey = key + '_views';
        let views = parseInt(localStorage.getItem(vcKey) || '0') + 1;
        localStorage.setItem(vcKey, views);
        const vc = document.createElement('div');
        vc.className = 'view-counter style-' + (wg.viewCounter.style || 'minimal');
        vc.innerHTML = `<i class="fas fa-eye"></i> ${views.toLocaleString()} ${wg.viewCounter.label || 'views'}`;
        insertWidget(vc, wg.viewCounter.position || 'bottom');
    }

    // Meta widget row (pronouns, location, age)
    const metaItems = [];
    if (wg.pronouns && wg.pronouns.enabled && wg.pronouns.text) metaItems.push(`<span class="widget-item"><i class="fas fa-user-tag"></i> ${wg.pronouns.text}</span>`);
    if (wg.location && wg.location.enabled && wg.location.text) metaItems.push(`<span class="widget-item"><i class="fas fa-map-marker-alt"></i> ${wg.location.text}</span>`);
    if (wg.age && wg.age.enabled && wg.age.birthday) {
        const age = Math.floor((Date.now() - new Date(wg.age.birthday)) / (365.25*24*3600*1000));
        metaItems.push(`<span class="widget-item"><i class="fas fa-birthday-cake"></i> ${age}</span>`);
    }
    if (metaItems.length) {
        const wr = document.createElement('div');
        wr.className = 'widget-row'; wr.innerHTML = metaItems.join('');
        insertWidget(wr, wg.metaPosition || 'bottom');
    }

    // Spotify widget (Interactive audio player)
    if (wg.spotifyWidget && wg.spotifyWidget.enabled) {
        const sp = document.createElement('div');
        sp.className = 'spotify-widget';
        sp.style.cursor = 'pointer';
        
        const art = wg.spotifyWidget.albumArt
            ? `<img class="spotify-art" src="${wg.spotifyWidget.albumArt}" alt="">`
            : `<div class="spotify-art placeholder" style="background:#181818;color:#555;display:flex;align-items:center;justify-content:center;"><i class="fas fa-music" style="font-size:18px;"></i></div>`;
            
        sp.innerHTML = `
            ${art}
            <div class="spotify-info">
                <div class="spotify-track">${wg.spotifyWidget.trackName || 'No track loaded'}</div>
                <div class="spotify-artist">${wg.spotifyWidget.artistName || 'Unknown Artist'}</div>
            </div>
            <div class="spotify-controls" style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-play play-btn" style="font-size: 14px; color: #1db954; width: 14px; text-align: center;"></i>
                <div class="spotify-eq"><span></span><span></span><span></span><span></span><span></span></div>
            </div>
        `;
        
        insertWidget(sp, wg.spotifyWidget.position || 'bottom');
        
        const aud = $('bg-audio');
        const playBtn = sp.querySelector('.play-btn');
        const eq = sp.querySelector('.spotify-eq');
        
        function updateWidgetState() {
            if (!aud || aud.paused) {
                if (playBtn) playBtn.className = 'fas fa-play play-btn';
                if (eq) eq.classList.remove('active');
            } else {
                if (playBtn) playBtn.className = 'fas fa-pause play-btn';
                if (eq) eq.classList.add('active');
            }
        }
        
        sp.addEventListener('click', (e) => {
            if (!aud) return;
            if (aud.paused) {
                aud.play().then(updateWidgetState).catch(()=>{});
            } else {
                aud.pause();
                updateWidgetState();
            }
        });
        
        if (aud) {
            aud.addEventListener('play', updateWidgetState);
            aud.addEventListener('pause', updateWidgetState);
            aud.addEventListener('playing', updateWidgetState);
            // Sync state on load in case autoplay worked
            setTimeout(updateWidgetState, 200);
        }
    }

    // ─────────────────────────────────────────────────────────
    // LAYOUT REORDERING
    // ─────────────────────────────────────────────────────────
    if (cfg.layout && Array.isArray(cfg.layout)) {
        const cardEl = $('card');
        if (cardEl) {
            cfg.layout.forEach(id => {
                const el = $('el-' + id);
                if (el) cardEl.appendChild(el);
            });
        }
    }

    // Section divider
    if (g(cfg, 'sectionDivider.enabled', false)) {
        const divStyle = g(cfg, 'sectionDivider.style', 'line');
        const divColor = g(cfg, 'sectionDivider.color', 'rgba(255,255,255,.1)');
        document.querySelectorAll('.el').forEach((el, i, arr) => {
            if (i < arr.length - 1 && el.style.display !== 'none') {
                const d = document.createElement('div');
                d.className = 'section-divider style-' + divStyle;
                d.style.background = divColor;
                el.after(d);
            }
        });
    }

    // ─────────────────────────────────────────────────────────
    // 13. SOCIALS
    // ─────────────────────────────────────────────────────────
    const socialsEl = $('profile-socials');
    if (cfg.socialLayout === 'grid') socialsEl.classList.add('layout-grid');
    (cfg.socials || []).forEach(s => {
        const a = document.createElement('a');
        a.href = s.url || '#'; a.target = '_blank'; a.title = s.label || '';
        a.innerHTML = `<i class="${s.icon}"></i>`; socialsEl.appendChild(a);
    });

    // ─────────────────────────────────────────────────────────
    // 14. LINKS
    // ─────────────────────────────────────────────────────────
    const linksEl = $('profile-links');
    const ll = cfg.linksLayout || 'list';
    if (ll === 'grid2') linksEl.classList.add('layout-grid2');
    else if (ll === 'grid3') linksEl.classList.add('layout-grid3');
    const hfx = g(cfg, 'buttons.hoverEffect', 'slideRight');
    const iconPos = g(cfg, 'buttons.iconPosition', 'left');
    const textAlign = g(cfg, 'buttons.textAlign', 'center');
    (cfg.links || []).forEach(l => {
        const a = document.createElement('a');
        a.href = l.url || '#'; if (l.newTab) a.target = '_blank';
        a.className = `link-btn hover-${hfx}${iconPos==='right'?' icon-right':''}${textAlign==='left'?' text-left':''}`;
        a.innerHTML = (l.icon ? `<i class="${l.icon}"></i>` : '') + `<span>${l.title || ''}</span>`;
        if (bt.fontSize) a.style.fontSize = bt.fontSize + 'px';
        if (bt.paddingV) a.style.padding = `${bt.paddingV}px ${bt.paddingH||20}px`;
        linksEl.appendChild(a);
    });

    // Render private links section
    if (cfg.privateLinksEnabled && Array.isArray(cfg.privateLinks) && cfg.privateLinks.length) {
        const privateContainer = document.createElement('div');
        privateContainer.className = 'private-links-wrapper';
        privateContainer.style.marginTop = '12px';
        privateContainer.style.width = '100%';
        
        const unlockBtn = document.createElement('a');
        unlockBtn.href = '#';
        unlockBtn.className = `link-btn hover-${hfx}${iconPos==='right'?' icon-right':''}${textAlign==='left'?' text-left':''}`;
        unlockBtn.style.background = 'rgba(255, 0, 255, 0.08)';
        unlockBtn.style.borderColor = 'rgba(255, 0, 255, 0.3)';
        unlockBtn.style.color = '#ff00ff';
        unlockBtn.innerHTML = `<i class="fas fa-lock" style="color: #ff00ff;"></i><span>${cfg.privateTitle || 'Unlock Private Links'}</span>`;
        
        if (bt.fontSize) unlockBtn.style.fontSize = bt.fontSize + 'px';
        if (bt.paddingV) unlockBtn.style.padding = `${bt.paddingV}px ${bt.paddingH||20}px`;
        
        const lockedList = document.createElement('div');
        lockedList.className = 'links-container';
        if (ll === 'grid2') lockedList.classList.add('layout-grid2');
        else if (ll === 'grid3') lockedList.classList.add('layout-grid3');
        lockedList.style.display = 'none';
        lockedList.style.marginTop = '10px';
        lockedList.style.width = '100%';
        
        cfg.privateLinks.forEach(l => {
            const a = document.createElement('a');
            a.href = l.url || '#'; if (l.newTab) a.target = '_blank';
            a.className = `link-btn hover-${hfx}${iconPos==='right'?' icon-right':''}${textAlign==='left'?' text-left':''}`;
            a.innerHTML = (l.icon ? `<i class="${l.icon}"></i>` : '') + `<span>${l.title || ''}</span>`;
            if (bt.fontSize) a.style.fontSize = bt.fontSize + 'px';
            if (bt.paddingV) a.style.padding = `${bt.paddingV}px ${bt.paddingH||20}px`;
            lockedList.appendChild(a);
        });
        
        unlockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (lockedList.style.display === 'none') {
                const pin = prompt('Enter PIN to access Private Links:');
                if (pin === (cfg.privatePw || '7777')) {
                    lockedList.style.display = 'flex';
                    unlockBtn.innerHTML = `<i class="fas fa-lock-open" style="color: #00cc66;"></i><span>Unlocked Tabs</span>`;
                    unlockBtn.style.borderColor = 'rgba(0, 204, 102, 0.4)';
                    unlockBtn.style.color = '#00cc66';
                    unlockBtn.style.background = 'rgba(0, 204, 102, 0.1)';
                } else if (pin !== null) {
                    alert('Incorrect PIN!');
                }
            } else {
                lockedList.style.display = 'none';
                unlockBtn.innerHTML = `<i class="fas fa-lock" style="color: #ff00ff;"></i><span>${cfg.privateTitle || 'Unlock Private Links'}</span>`;
                unlockBtn.style.borderColor = 'rgba(255, 0, 255, 0.3)';
                unlockBtn.style.color = '#ff00ff';
                unlockBtn.style.background = 'rgba(255, 0, 255, 0.08)';
            }
        });
        
        privateContainer.appendChild(unlockBtn);
        privateContainer.appendChild(lockedList);
        linksEl.appendChild(privateContainer);
    }

    // ─────────────────────────────────────────────────────────
    // 15. BACKGROUND ENGINE
    // ─────────────────────────────────────────────────────────
    const bg = cfg.background || {};
    const bgC = $('bg-container');
    bgC.style.opacity = bg.opacity !== undefined ? bg.opacity : 1;
    if (bg.blur) bgC.style.filter = `blur(${bg.blur}px)`;

    switch (bg.type) {
        case 'image':
            const bImg = $('bg-image'); bImg.style.display='block'; bImg.src=bg.value||'';
            bImg.style.objectFit = bg.size||'cover'; bImg.style.objectPosition = bg.position||'center';
            if (bg.parallax) enableParallax(bImg); break;
        case 'video':
            const bVid = $('bg-video'); bVid.style.display='block'; bVid.src=bg.value||'';
            bVid.muted=bg.videoMuted!==false; bVid.loop=bg.videoLoop!==false; break;
        case 'color': $('bg-color-layer').style.background = bg.color||c.bg||'#000'; break;
        case 'gradient': $('bg-color-layer').style.background = `linear-gradient(${bg.gradientDir||'135deg'},${bg.gradientColor1||'#000'},${bg.gradientColor2||'#111'},${bg.gradientColor3||'#000'})`; break;
        case 'aurora': $('bg-color-layer').classList.add('bg-aurora'); break;
        case 'plasma': $('bg-color-layer').classList.add('bg-plasma'); break;
        case 'topographic': bgCanvas(initTopographic); break;
        case 'waves': bgCanvas(initWaves); break;
        case 'starfield': bgCanvas(initStarfield); break;
        case 'matrix': bgCanvas(initMatrix); break;
        case 'particles': bgCanvas(initParticles); break;
        case 'lava': bgCanvas(initLava); break;
        case 'bubbles': bgCanvas(initBubbles); break;
        case 'electric': bgCanvas(initElectric); break;
        case 'vortex': bgCanvas(initVortex); break;
        case 'glassRain': bgCanvas(initGlassRain); break;
        case 'hypnotic': bgCanvas(initHypnotic); break;
        case 'geometric': bgCanvas(initGeometric); break;
        case 'flame': bgCanvas(initFlame); break;
        // Nebula & Space
        case 'nebula': bgCanvas(initNebula); break;
        case 'spacewarp': bgCanvas(initSpaceWarp); break;
        case 'supernova': bgCanvas(initSupernova); break;
        case 'blackhole': bgCanvas(initBlackhole); break;
        case 'constellation': bgCanvas(initConstellation); break;
        case 'fireflies': bgCanvas(initFireflies); break;
        case 'twinkling': bgCanvas(initTwinkling); break;
        case 'sparklesbg': bgCanvas(initSparklesBg); break;
        // Cyber & Retro
        case 'cybergrid': bgCanvas(initCyberGrid); break;
        case 'digitalwaves': bgCanvas(initDigitalWaves); break;
        case 'retrogrid': bgCanvas(initRetroGrid); break;
        case 'matrixgreen': bgCanvas(initMatrixGreen); break;
        case 'hexgrid': bgCanvas(initHexGrid); break;
        case 'hologram': bgCanvas(initHologram); break;
        // Nature & Weather
        case 'rainstorm': bgCanvas(initRainStorm); break;
        case 'snowstorm': bgCanvas(initSnowStorm); break;
        case 'sakura': bgCanvas(initSakura); break;
        case 'leaves': bgCanvas(initLeaves); break;
        case 'clouds': bgCanvas(initClouds); break;
        case 'fireworksbg': bgCanvas(initFireworksBg); break;
        // Geometric & Math
        case 'kaleidoscope': bgCanvas(initKaleidoscope); break;
        case 'cosinewaves': bgCanvas(initCosineWaves); break;
        case 'fractaltree': bgCanvas(initFractalTree); break;
        case 'binarystreams': bgCanvas(initBinaryStreams); break;
        case 'sinusoidal': bgCanvas(initSinusoidal); break;
        case 'dnahelix': bgCanvas(initDnaHelix); break;
        // Fluid & Flow
        case 'rainbowflow': bgCanvas(initRainbowFlow); break;
        case 'colorvortex': bgCanvas(initColorVortex); break;
        case 'waterripple': bgCanvas(initWaterRipple); break;
        case 'lavabubbles': bgCanvas(initLavaBubbles); break;
        case 'quantum': bgCanvas(initQuantum); break;
        case 'acidtrip': bgCanvas(initAcidTrip); break;
        case 'hearts': bgCanvas(initHearts); break;
        case 'confettibg': bgCanvas(initConfettiBg); break;
        case 'glitchnoise': bgCanvas(initGlitchNoise); break;
        case 'abstractfluid': bgCanvas(initAbstractFluid); break;
    }

    // ─────────────────────────────────────────────────────────
    // 16. EFFECTS
    // ─────────────────────────────────────────────────────────
    const fx = cfg.effects || {};
    if (fx.crt) { const el=$('crt-overlay'); el.style.display='block'; el.style.opacity=fx.crtIntensity||.25; }
    if (fx.vignette) { const el=$('vignette-overlay'); el.style.display='block'; el.style.opacity=fx.vignetteIntensity||.5; }
    if (fx.grain) $('grain-overlay').style.display='block';
    if (fx.screenGlow) { const sg=$('screen-glow'); if(sg){ sg.style.display='block'; sg.style.background='transparent'; sg.style.boxShadow='inset 0 0 100px '+(fx.screenGlowColor||'#f0f'); sg.style.opacity=fx.screenGlowIntensity||.3; } }
    if (fx.snow) initSnow(fx.snowDensity||50);
    if (fx.ambientParticles) initAmbientParticles(fx.ambientColor||'#fff', fx.ambientDensity||30);
    if (fx.clickRipple) enableRipple();
    if (fx.clickFireworks) enableFireworks();
    if (fx.confetti) setTimeout(launchConfetti, 800);

    // ─────────────────────────────────────────────────────────
    // 17. CURSOR
    // ─────────────────────────────────────────────────────────
    const cur = cfg.cursor || {};
    if (cur.type === 'crosshair') { document.body.style.cursor='crosshair'; }
    else if (cur.type === 'custom' && cur.customUrl) { document.body.style.cursor=`url(${cur.customUrl}),auto`; }
    else if (cur.type && cur.type !== 'none') {
        document.body.style.cursor = 'none';
        const dot = document.createElement('div');
        dot.id = 'cursor-dot';
        const dotSize = (cur.size||8)+'px';
        dot.style.cssText = `width:${dotSize};height:${dotSize};background:${cur.color||'white'};`;
        document.body.appendChild(dot);
        document.addEventListener('mousemove', e => {
            dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px';
            const dens = cur.trailDensity||3;
            for (let i=0;i<dens;i++) spawnTrail(e.clientX, e.clientY, cur, c.accent||'#fff');
        });
    }

    // ─────────────────────────────────────────────────────────
    // 18. 3D TILT
    // ─────────────────────────────────────────────────────────
    const container = $('profile-container');
    if (card.tilt !== false) {
        const str = card.tiltStrength || 35;
        document.addEventListener('mousemove', e => {
            container.style.transform = `rotateY(${(window.innerWidth/2-e.clientX)/str}deg) rotateX(${(window.innerHeight/2-e.clientY)/str}deg)`;
        });
        document.addEventListener('mouseleave', () => { container.style.transform = ''; });
    }

    // ─────────────────────────────────────────────────────────
    // 19. ENTER SCREEN
    // ─────────────────────────────────────────────────────────
    const en = cfg.enterScreen || {};
    const enterEl = $('enter-screen');
    if (en.enabled === false) {
        if (enterEl) enterEl.remove();
        initAudio();
    } else if (enterEl) {
        if (en.bg) enterEl.style.background = en.bg;
        if (en.textColor) enterEl.style.color = en.textColor;
        if (en.text) $('enter-text').textContent = en.text;

        // Optional avatar on the enter screen
        const enterAvatar = $('enter-avatar');
        const showEnterAvatar = en.showAvatar !== false && cfg.showAvatar !== false && cfg.avatarUrl;
        if (enterAvatar && showEnterAvatar) {
            enterAvatar.src = cfg.avatarUrl;
            enterAvatar.style.display = 'block';
        }

        let dismissed = false;
        function dismissEnter() {
            if (dismissed) return;
            dismissed = true;
            enterEl.classList.add('hidden');
            setTimeout(() => enterEl.remove(), 700);
            initAudio();
        }
        enterEl.addEventListener('click', dismissEnter, { once: true });
        enterEl.addEventListener('touchstart', dismissEnter, { once: true, passive: true });
        enterEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dismissEnter();
            }
        }, { once: true });
    } else {
        initAudio();
    }

    // ─────────────────────────────────────────────────────────
    // 20. AUDIO + VISUALIZER
    // ─────────────────────────────────────────────────────────
    function initAudio() {
        const aud = $('bg-audio');
        if (!cfg.audio || !cfg.audio.url) return;
        
        aud.addEventListener('error', (e) => {
            console.error("Audio element error loading URL '" + cfg.audio.url + "':", aud.error);
        });

        aud.src = cfg.audio.url;
        aud.volume = parseFloat(cfg.audio.volume || .5);
        aud.play().then(() => {
            console.log("Audio started playing successfully: " + cfg.audio.url);
        }).catch(err => {
            console.warn("Audio play() blocked or failed: ", err);
        });
        const vis = cfg.audioVisualizer || {};
        if (vis.enabled) initVisualizer(aud, vis);
    }

    // ─────────────────────────────────────────────────────────
    // BACKGROUND CANVAS HELPER
    // ─────────────────────────────────────────────────────────
    function bgCanvas(fn) {
        const canvas = $('bg-canvas');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        window.addEventListener('resize', () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; });
        fn(canvas, canvas.getContext('2d'));
    }

    // ─────────────────────────────────────────────────────────
    // BACKGROUND ENGINES
    // ─────────────────────────────────────────────────────────
    function initTopographic(canvas, ctx) {
        let t=0; const accent=c.border||'rgba(255,255,255,.08)';
        function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.strokeStyle=accent; ctx.lineWidth=1;
            for(let i=0;i<35;i++){ctx.beginPath();for(let x=0;x<=canvas.width;x+=15){const y=i*35-100+Math.sin(x*.004+t)*70+Math.cos(x*.006-t*.4)*40;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
            t+=.01; requestAnimationFrame(draw); } draw();
    }
    function initWaves(canvas, ctx) {
        let t=0; const accent=c.accent||'#fff';
        function draw(){ ctx.fillStyle=c.bg||'#000';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,canvas.height);for(let x=0;x<=canvas.width;x+=10){const y=Math.sin(x*.006+t+i*.8)*90+canvas.height*.55+i*40;ctx.lineTo(x,y);}ctx.lineTo(canvas.width,canvas.height);ctx.closePath();ctx.fillStyle=accent;ctx.globalAlpha=.07+i*.03;ctx.fill();}
            ctx.globalAlpha=1; t+=.015; requestAnimationFrame(draw); } draw();
    }
    function initStarfield(canvas, ctx) {
        const stars=Array.from({length:250},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,z:Math.random()*canvas.width}));
        function draw(){ ctx.fillStyle=c.bg||'#000';ctx.fillRect(0,0,canvas.width,canvas.height);
            stars.forEach(s=>{s.z-=2.5;if(s.z<=0){s.x=Math.random()*canvas.width;s.y=Math.random()*canvas.height;s.z=canvas.width;}const sx=(s.x-canvas.width/2)*(canvas.width/s.z)+canvas.width/2;const sy=(s.y-canvas.height/2)*(canvas.width/s.z)+canvas.height/2;const r=2.5*(1-s.z/canvas.width);ctx.fillStyle=c.accent||'#fff';ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();});
            requestAnimationFrame(draw); } draw();
    }
    function initMatrix(canvas, ctx) {
        const cols=Math.floor(canvas.width/16),drops=Array(cols).fill(1);
        function draw(){ ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=c.accent||'#0f0';ctx.font='14px monospace';
            drops.forEach((y,i)=>{ctx.fillText(String.fromCharCode(0x30A0+Math.random()*96),i*16,y*16);if(y*16>canvas.height&&Math.random()>.975)drops[i]=0;drops[i]++;});
            setTimeout(draw,50); } draw();
    }
    function initParticles(canvas, ctx) {
        const pts=Array.from({length:80},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.8,vy:(Math.random()-.5)*.8,r:Math.random()*2+1}));
        function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height);
            pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.fillStyle=c.accent||'#fff';ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});
            ctx.globalAlpha=.12;ctx.strokeStyle=c.accent||'#fff';ctx.lineWidth=.5;
            for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}}
            ctx.globalAlpha=1; requestAnimationFrame(draw); } draw();
    }
    function initLava(canvas, ctx) {
        const blobs=Array.from({length:8},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:80+Math.random()*120,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5}));
        function draw(){ ctx.fillStyle=c.bg||'#000';ctx.fillRect(0,0,canvas.width,canvas.height);
            blobs.forEach(b=>{b.x+=b.vx;b.y+=b.vy;if(b.x<-b.r||b.x>canvas.width+b.r)b.vx*=-1;if(b.y<-b.r||b.y>canvas.height+b.r)b.vy*=-1;const grad=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);grad.addColorStop(0,c.accent||'rgba(255,80,0,.6)');grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();});
            ctx.globalAlpha=1; requestAnimationFrame(draw); } draw();
    }
    function initBubbles(canvas, ctx) {
        const bubs=Array.from({length:25},()=>({x:Math.random()*canvas.width,y:canvas.height+Math.random()*200,r:10+Math.random()*40,speed:.3+Math.random()*.7,drift:(Math.random()-.5)*.3}));
        function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height);
            bubs.forEach(b=>{b.y-=b.speed;b.x+=b.drift;if(b.y<-b.r*2){b.y=canvas.height+b.r;b.x=Math.random()*canvas.width;}ctx.strokeStyle=c.accent||'rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.05)';ctx.fill();});
            ctx.globalAlpha=1; requestAnimationFrame(draw); } draw();
    }
    function initElectric(canvas, ctx) {
        let t=0;
        function lightning(x1,y1,x2,y2,rough,depth){ if(depth===0){ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);return;}const mx=(x1+x2)/2+(Math.random()-.5)*rough,my=(y1+y2)/2+(Math.random()-.5)*rough;lightning(x1,y1,mx,my,rough/2,depth-1);lightning(mx,my,x2,y2,rough/2,depth-1); }
        function draw(){ ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=c.accent||'#0ff';ctx.lineWidth=1;ctx.globalAlpha=.7;
            for(let i=0;i<3;i++){ctx.beginPath();lightning(Math.random()*canvas.width,0,Math.random()*canvas.width,canvas.height,150,6);ctx.stroke();}
            ctx.globalAlpha=1; setTimeout(draw,80); } draw();
    }
    function initVortex(canvas, ctx) {
        let t=0; const cx=canvas.width/2,cy=canvas.height/2;
        function draw(){ ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=c.accent||'#fff';
            for(let i=0;i<20;i++){const a=t+i*.5,r=i*30,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.lineWidth=(20-i)*.05+.2;ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.stroke();}
            ctx.globalAlpha=1; t+=.03; requestAnimationFrame(draw); } draw();
    }
    function initGlassRain(canvas, ctx) {
        const drops=Array.from({length:80},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,l:20+Math.random()*80,speed:4+Math.random()*8,op:Math.random()*.4+.1}));
        function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height);
            drops.forEach(d=>{d.y+=d.speed;if(d.y>canvas.height+d.l){d.y=-d.l;d.x=Math.random()*canvas.width;}const g=ctx.createLinearGradient(d.x,d.y,d.x,d.y+d.l);g.addColorStop(0,'transparent');g.addColorStop(.5,c.accent||'rgba(255,255,255,.5)');g.addColorStop(1,'transparent');ctx.strokeStyle=g;ctx.globalAlpha=d.op;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x,d.y+d.l);ctx.stroke();});
            ctx.globalAlpha=1; requestAnimationFrame(draw); } draw();
    }
    function initHypnotic(canvas, ctx) {
        let t=0; const cx=canvas.width/2,cy=canvas.height/2;
        function draw(){ ctx.fillStyle='rgba(0,0,0,.03)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<20;i++){const r=i*30+Math.sin(t+i*.2)*20;ctx.strokeStyle=c.accent||'#fff';ctx.globalAlpha=.15;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();}
            ctx.globalAlpha=1; t+=.02; requestAnimationFrame(draw); } draw();
    }
    function initGeometric(canvas, ctx) {
        let t=0;
        function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=c.accent||'#fff';ctx.globalAlpha=.1;ctx.lineWidth=.5;
            const size=60;
            for(let x=0;x<canvas.width+size;x+=size)for(let y=0;y<canvas.height+size;y+=size){ctx.save();ctx.translate(x,y);ctx.rotate(t+x*.01+y*.01);ctx.beginPath();ctx.rect(-size/3,-size/3,size/1.5,size/1.5);ctx.stroke();ctx.restore();}
            ctx.globalAlpha=1; t+=.005; requestAnimationFrame(draw); } draw();
    }
    function initFlame(canvas, ctx) {
        const particles=[];
        function spawnFlameParticle(){particles.push({x:canvas.width/2+(Math.random()-.5)*100,y:canvas.height,vx:(Math.random()-.5)*2,vy:-(1+Math.random()*4),life:1,r:5+Math.random()*20});}
        function draw(){ ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<3;i++) spawnFlameParticle();
            for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life-=.02;p.r*=.98;if(p.life<=0){particles.splice(i,1);continue;}const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(255,255,100,${p.life})`);g.addColorStop(.5,`rgba(255,50,0,${p.life*.6})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
            requestAnimationFrame(draw); } draw();
    }

    // ─────────────────────────────────────────────────────────
    // EXTENDED BACKGROUND ENGINES
    // ─────────────────────────────────────────────────────────
    function initNebula(canvas, ctx) {
        const blobs=Array.from({length:12},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:100+Math.random()*200,h:Math.random()*360,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.03)';ctx.fillRect(0,0,canvas.width,canvas.height);
            blobs.forEach(b=>{b.x+=b.vx;b.y+=b.vy;if(b.x<-b.r)b.x=canvas.width+b.r;if(b.x>canvas.width+b.r)b.x=-b.r;if(b.y<-b.r)b.y=canvas.height+b.r;if(b.y>canvas.height+b.r)b.y=-b.r;const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);g.addColorStop(0,`hsla(${b.h},80%,60%,0.12)`);g.addColorStop(.5,`hsla(${(b.h+40)%360},70%,40%,0.06)`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();});
            requestAnimationFrame(draw);}draw();
    }
    function initSpaceWarp(canvas, ctx) {
        const stars=Array.from({length:300},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,z:Math.random()*canvas.width,pz:0}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const cx=canvas.width/2,cy=canvas.height/2;
            stars.forEach(s=>{s.pz=s.z;s.z-=6;if(s.z<=0){s.x=Math.random()*canvas.width;s.y=Math.random()*canvas.height;s.z=canvas.width;s.pz=s.z;}const sx=(s.x-cx)*(canvas.width/s.z)+cx;const sy=(s.y-cy)*(canvas.width/s.z)+cy;const px=(s.x-cx)*(canvas.width/s.pz)+cx;const py=(s.y-cy)*(canvas.width/s.pz)+cy;ctx.strokeStyle=`rgba(255,255,255,${1-s.z/canvas.width})`;ctx.lineWidth=2*(1-s.z/canvas.width);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(sx,sy);ctx.stroke();});
            requestAnimationFrame(draw);}draw();
    }
    function initSupernova(canvas, ctx) {
        let t=0;const cx=canvas.width/2,cy=canvas.height/2;
        function draw(){ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<8;i++){const a=t*0.5+i*Math.PI/4;const r=100+Math.sin(t*2+i)*60;const x=cx+Math.cos(a)*r;const y=cy+Math.sin(a)*r;const g=ctx.createRadialGradient(x,y,0,x,y,80+Math.sin(t+i)*40);g.addColorStop(0,`hsla(${(i*45+t*20)%360},100%,70%,.4)`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,80,0,Math.PI*2);ctx.fill();}
            t+=.025;requestAnimationFrame(draw);}draw();
    }
    function initBlackhole(canvas, ctx) {
        let t=0;const cx=canvas.width/2,cy=canvas.height/2;
        const pts=Array.from({length:300},()=>({a:Math.random()*Math.PI*2,r:80+Math.random()*300,speed:0.005+Math.random()*0.02,drift:0.002+Math.random()*0.005}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(0,0,canvas.width,canvas.height);
            pts.forEach(p=>{p.a+=p.speed;p.r-=p.drift;if(p.r<30){p.r=80+Math.random()*300;p.a=Math.random()*Math.PI*2;}const x=cx+Math.cos(p.a)*p.r;const y=cy+Math.sin(p.a)*p.r;const alpha=Math.min(1,(p.r-30)/120);ctx.fillStyle=`rgba(180,100,255,${alpha*0.6})`;ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();});
            const g=ctx.createRadialGradient(cx,cy,0,cx,cy,80);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,80,0,Math.PI*2);ctx.fill();
            t+=.02;requestAnimationFrame(draw);}draw();
    }
    function initConstellation(canvas, ctx) {
        const nodes=Array.from({length:60},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*2+1}));
        function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);
            nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>canvas.width)n.vx*=-1;if(n.y<0||n.y>canvas.height)n.vy*=-1;ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();});
            for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){ctx.strokeStyle=`rgba(255,255,255,${.4*(1-d/150)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}}
            requestAnimationFrame(draw);}draw();
    }
    function initFireflies(canvas, ctx) {
        const flies=Array.from({length:60},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:1+Math.random()*2,life:Math.random(),speed:0.005+Math.random()*0.01,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,h:60+Math.random()*60}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.06)';ctx.fillRect(0,0,canvas.width,canvas.height);
            flies.forEach(f=>{f.x+=f.vx+Math.sin(f.life*3)*.5;f.y+=f.vy+Math.cos(f.life*2)*.3;f.life+=f.speed;if(f.x<0)f.x=canvas.width;if(f.x>canvas.width)f.x=0;if(f.y<0)f.y=canvas.height;if(f.y>canvas.height)f.y=0;const a=Math.abs(Math.sin(f.life));const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r*4);g.addColorStop(0,`hsla(${f.h},100%,80%,${a*.8})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,f.r*4,0,Math.PI*2);ctx.fill();});
            requestAnimationFrame(draw);}draw();
    }
    function initTwinkling(canvas, ctx) {
        const stars=Array.from({length:200},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2+.5,phase:Math.random()*Math.PI*2,speed:0.02+Math.random()*0.05}));
        function draw(){ctx.fillStyle=c.bg||'#000';ctx.fillRect(0,0,canvas.width,canvas.height);
            stars.forEach(s=>{s.phase+=s.speed;const a=Math.abs(Math.sin(s.phase))*.9+.1;ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.shadowBlur=s.r*3;ctx.shadowColor='white';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});ctx.shadowBlur=0;
            requestAnimationFrame(draw);}draw();
    }
    function initSparklesBg(canvas, ctx) {
        const sparks=Array.from({length:80},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:1+Math.random()*3,life:Math.random(),speed:0.01+Math.random()*0.02,h:Math.random()*360}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,0,canvas.width,canvas.height);
            sparks.forEach(s=>{s.life+=s.speed;if(s.life>1){s.life=0;s.x=Math.random()*canvas.width;s.y=Math.random()*canvas.height;}const a=Math.sin(s.life*Math.PI);ctx.fillStyle=`hsla(${s.h},100%,80%,${a})`;ctx.beginPath();const sz=s.r*a;for(let i=0;i<4;i++){const a1=i*Math.PI/2;ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+Math.cos(a1)*sz*3,s.y+Math.sin(a1)*sz*3);}ctx.strokeStyle=`hsla(${s.h},100%,80%,${a*.7})`;ctx.lineWidth=1;ctx.stroke();ctx.arc(s.x,s.y,sz,0,Math.PI*2);ctx.fill();});
            requestAnimationFrame(draw);}draw();
    }
    function initCyberGrid(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const vp=canvas.height*.6,sz=80;ctx.strokeStyle=c.accent||'#0ff';ctx.lineWidth=.5;
            for(let x=-canvas.width;x<canvas.width*2;x+=sz){ctx.globalAlpha=.3;ctx.beginPath();const tx=(x+t*30)%canvas.width;ctx.moveTo(tx,vp);ctx.lineTo(canvas.width/2,0);ctx.stroke();}
            for(let z=0;z<10;z++){const progress=((z/10+t*.05)%1);const scale=progress;const y=vp+progress*canvas.height*.5;const w=canvas.width*scale*2;ctx.globalAlpha=scale*.5;ctx.beginPath();ctx.moveTo(canvas.width/2-w/2,y);ctx.lineTo(canvas.width/2+w/2,y);ctx.stroke();}
            ctx.globalAlpha=1;t+=.01;requestAnimationFrame(draw);}draw();
    }
    function initDigitalWaves(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const bars=80;const bw=canvas.width/bars;ctx.strokeStyle=c.accent||'#0ff';
            for(let i=0;i<bars;i++){const h=Math.abs(Math.sin(i*.15+t)*80+Math.sin(i*.3-t*.7)*40);const cy=canvas.height/2;ctx.globalAlpha=.6;ctx.lineWidth=bw*.6;ctx.beginPath();ctx.moveTo(i*bw+bw/2,cy-h);ctx.lineTo(i*bw+bw/2,cy+h);ctx.stroke();}
            ctx.globalAlpha=1;t+=.05;requestAnimationFrame(draw);}draw();
    }
    function initRetroGrid(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='#0a0015';ctx.fillRect(0,0,canvas.width,canvas.height);
            const vp=canvas.height*.55,grid=60;ctx.lineWidth=.7;
            for(let x=0;x<canvas.width+grid;x+=grid){const progress=(x/canvas.width);ctx.strokeStyle=`rgba(255,0,200,${.3+progress*.2})`;ctx.beginPath();ctx.moveTo(x,vp);ctx.lineTo(canvas.width/2+(x-canvas.width/2)*3,canvas.height);ctx.stroke();}
            for(let z=1;z<10;z++){const y=vp+(canvas.height-vp)*(((z/10)+t*.08)%1);const scale=((z/10)+t*.08)%1;const w=canvas.width*scale*1.5;ctx.strokeStyle=`rgba(0,200,255,${scale*.6})`;ctx.beginPath();ctx.moveTo(canvas.width/2-w/2,y);ctx.lineTo(canvas.width/2+w/2,y);ctx.stroke();}
            ctx.globalAlpha=1;t+=.01;requestAnimationFrame(draw);}draw();
    }
    function initMatrixGreen(canvas, ctx) {
        const cols=Math.floor(canvas.width/14),drops=Array(cols).fill(0).map(()=>Math.random()*-100);
        function draw(){ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.font='13px monospace';
            drops.forEach((y,i)=>{const char=String.fromCharCode(0x30A0+Math.random()*96);const bright=y*14<canvas.height*0.1?1:.5;ctx.fillStyle=`rgba(0,${Math.floor(180+bright*75)},50,${bright})`;ctx.fillText(char,i*14,y*14);if(y*14>canvas.height&&Math.random()>.975)drops[i]=0;drops[i]+=.7;});
            setTimeout(draw,45);}draw();
    }
    function initHexGrid(canvas, ctx) {
        let t=0;
        function hexPath(x,y,r){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();}
        function draw(){ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const r=35,h=r*Math.sqrt(3);ctx.lineWidth=.5;
            for(let row=-1;row<canvas.height/h+1;row++){for(let col=-1;col<canvas.width/(r*3)+1;col++){const x=col*r*3+(row%2)*r*1.5;const y=row*h;const pulse=Math.sin(x*.005+y*.005+t)*.5+.5;ctx.strokeStyle=`rgba(${c.accent?hexToRgb(c.accent,pulse*.4):'0,180,255,'+pulse*.25})`;hexPath(x,y,r-2);ctx.stroke();}}
            ctx.globalAlpha=1;t+=.02;requestAnimationFrame(draw);}draw();
        function hexToRgb(hex,a){try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`${r},${g},${b},${a}`;}catch(e){return`0,200,255,${a}`;}}
    }
    function initHologram(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,20,.15)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const scanY=((t*80)%canvas.height);ctx.fillStyle='rgba(0,220,255,.06)';ctx.fillRect(0,scanY-2,canvas.width,4);
            for(let y=0;y<canvas.height;y+=4){ctx.fillStyle=`rgba(0,0,0,${.1+Math.sin(y*.1+t)*0.05})`;ctx.fillRect(0,y,canvas.width,2);}
            ctx.strokeStyle='rgba(0,220,255,.3)';ctx.lineWidth=1;
            for(let i=0;i<5;i++){const x=canvas.width/2+Math.sin(t*1.5+i)*150;ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+Math.sin(t+i)*80,canvas.height);ctx.stroke();}
            ctx.globalAlpha=1;t+=.015;requestAnimationFrame(draw);}draw();
    }
    function initRainStorm(canvas, ctx) {
        const drops=Array.from({length:200},()=>({x:Math.random()*canvas.width*1.5,y:Math.random()*canvas.height,l:15+Math.random()*30,speed:12+Math.random()*15}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.strokeStyle='rgba(180,220,255,.5)';ctx.lineWidth=1;
            drops.forEach(d=>{d.y+=d.speed;d.x-=d.speed*.4;if(d.y>canvas.height+d.l){d.y=-d.l;d.x=Math.random()*canvas.width*1.5;}ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-d.speed*.3,d.y+d.l);ctx.stroke();});
            requestAnimationFrame(draw);}draw();
    }
    function initSnowStorm(canvas, ctx) {
        const flakes=Array.from({length:150},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:1+Math.random()*4,speed:.5+Math.random()*2,drift:(Math.random()-.5)*.5,phase:Math.random()*Math.PI*2}));
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle='rgba(255,255,255,.8)';
            flakes.forEach(f=>{f.y+=f.speed;f.x+=f.drift+Math.sin(t+f.phase)*.5;if(f.y>canvas.height+f.r){f.y=-f.r;f.x=Math.random()*canvas.width;}if(f.x<0)f.x=canvas.width;if(f.x>canvas.width)f.x=0;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();});
            ctx.globalAlpha=1;t+=.02;requestAnimationFrame(draw);}draw();
    }
    function initSakura(canvas, ctx) {
        const petals=Array.from({length:60},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,r:3+Math.random()*5,speed:.5+Math.random()*1.5,drift:(Math.random()-.5)*.5,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.05}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.06)';ctx.fillRect(0,0,canvas.width,canvas.height);
            petals.forEach(p=>{p.y+=p.speed;p.x+=p.drift+Math.sin(p.y*.02)*.5;p.rot+=p.rotSpeed;if(p.y>canvas.height+10){p.y=-10;p.x=Math.random()*canvas.width;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='rgba(255,180,200,.6)';ctx.beginPath();ctx.ellipse(0,0,p.r,p.r*.6,0,0,Math.PI*2);ctx.fill();ctx.restore();});
            requestAnimationFrame(draw);}draw();
    }
    function initLeaves(canvas, ctx) {
        const leaves=Array.from({length:40},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,speed:1+Math.random()*2,drift:(Math.random()-.5)*2,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.08,h:20+Math.floor(Math.random()*3)*30,size:8+Math.random()*12}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.06)';ctx.fillRect(0,0,canvas.width,canvas.height);
            leaves.forEach(l=>{l.y+=l.speed;l.x+=l.drift;l.rot+=l.rotSpeed;if(l.y>canvas.height+20){l.y=-20;l.x=Math.random()*canvas.width;}ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.rot);ctx.fillStyle=`hsla(${l.h},60%,35%,.7)`;ctx.beginPath();ctx.ellipse(0,0,l.size,l.size*.5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`hsla(${l.h},50%,25%,.4)`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-l.size,0);ctx.lineTo(l.size,0);ctx.stroke();ctx.restore();});
            requestAnimationFrame(draw);}draw();
    }
    function initClouds(canvas, ctx) {
        const clouds=Array.from({length:6},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height*.6,r:60+Math.random()*100,speed:.2+Math.random()*.4,alpha:.1+Math.random()*.2}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.02)';ctx.fillRect(0,0,canvas.width,canvas.height);
            clouds.forEach(cl=>{cl.x+=cl.speed;if(cl.x-cl.r>canvas.width)cl.x=-cl.r;ctx.globalAlpha=cl.alpha;const g=ctx.createRadialGradient(cl.x,cl.y,0,cl.x,cl.y,cl.r);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cl.x,cl.y,cl.r,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cl.x-cl.r*.5,cl.y+cl.r*.2,cl.r*.7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cl.x+cl.r*.4,cl.y+cl.r*.1,cl.r*.6,0,Math.PI*2);ctx.fill();});
            ctx.globalAlpha=1;requestAnimationFrame(draw);}draw();
    }
    function initFireworksBg(canvas, ctx) {
        const rockets=[];let t=0;
        function spawnRocket(){rockets.push({x:Math.random()*canvas.width*.8+canvas.width*.1,y:canvas.height,vy:-8-Math.random()*5,exploded:false,h:Math.random()*360,particles:[]});}
        function draw(){ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(0,0,canvas.width,canvas.height);
            if(Math.random()<.03)spawnRocket();
            for(let i=rockets.length-1;i>=0;i--){const r=rockets[i];if(!r.exploded){r.y+=r.vy;ctx.fillStyle=`hsl(${r.h},100%,80%)`;ctx.beginPath();ctx.arc(r.x,r.y,2,0,Math.PI*2);ctx.fill();if(r.y<canvas.height*.4){r.exploded=true;for(let j=0;j<40;j++){const a=j/40*Math.PI*2;const spd=3+Math.random()*4;r.particles.push({x:r.x,y:r.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:1});}}}else{let alive=false;r.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=.02;if(p.life>0){alive=true;ctx.globalAlpha=p.life;ctx.fillStyle=`hsl(${r.h},100%,70%)`;ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();}});ctx.globalAlpha=1;if(!alive)rockets.splice(i,1);}}
            t++;requestAnimationFrame(draw);}draw();
    }
    function initKaleidoscope(canvas, ctx) {
        let t=0;const cx=canvas.width/2,cy=canvas.height/2;const slices=8;
        function draw(){ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let s=0;s<slices;s++){ctx.save();ctx.translate(cx,cy);ctx.rotate(s*Math.PI*2/slices);for(let i=0;i<5;i++){const r=50+i*40+Math.sin(t+i)*.30;const x=Math.cos(t*.7+i)*r;const y=Math.sin(t*.5+i)*r;ctx.fillStyle=`hsla(${(t*40+i*60+s*45)%360},80%,60%,.15)`;ctx.beginPath();ctx.arc(x,y,20+Math.sin(t+i)*10,0,Math.PI*2);ctx.fill();}ctx.restore();}
            t+=.02;requestAnimationFrame(draw);}draw();
    }
    function initCosineWaves(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let layer=0;layer<6;layer++){ctx.beginPath();for(let x=0;x<=canvas.width;x+=4){const y=canvas.height/2+Math.cos(x*.012+t+layer*.5)*60+Math.sin(x*.007-t*.8+layer)*.40;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.strokeStyle=`hsla(${(layer*60+t*20)%360},70%,60%,.3)`;ctx.lineWidth=1.5;ctx.stroke();}
            t+=.02;requestAnimationFrame(draw);}draw();
    }
    function initFractalTree(canvas, ctx) {
        let t=0;
        function branch(x,y,angle,depth,len){if(depth===0)return;const x2=x+Math.cos(angle)*len,y2=y+Math.sin(angle)*len;ctx.strokeStyle=`hsla(${120-depth*15},${40+depth*8}%,${40+depth*6}%,.4)`;ctx.lineWidth=depth*.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();const spread=0.4+Math.sin(t+depth*.5)*0.1;branch(x2,y2,angle-spread,depth-1,len*.72);branch(x2,y2,angle+spread,depth-1,len*.72);}
        function draw(){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,0,canvas.width,canvas.height);branch(canvas.width/2,canvas.height,-(Math.PI/2),9,80+Math.sin(t)*15);t+=.01;setTimeout(draw,80);}draw();
    }
    function initBinaryStreams(canvas, ctx) {
        const cols=Math.floor(canvas.width/20);const streams=Array.from({length:cols},()=>({y:-Math.random()*canvas.height,speed:2+Math.random()*4,bits:[]}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.font='12px monospace';
            streams.forEach((s,i)=>{s.y+=s.speed;if(s.y>canvas.height){s.y=-20;}const chars=Math.floor(canvas.height/20);for(let j=0;j<chars;j++){const cy=s.y-j*20;if(cy<0||cy>canvas.height)continue;const fading=j/chars;ctx.fillStyle=`rgba(0,200,80,${fading*.6})`;ctx.fillText(Math.round(Math.random()),i*20,cy);}});
            requestAnimationFrame(draw);}draw();
    }
    function initSinusoidal(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const rows=Math.ceil(canvas.height/40)+1;const cols=Math.ceil(canvas.width/40)+1;
            for(let r=0;r<rows;r++){for(let cc=0;cc<cols;cc++){const x=cc*40,y=r*40;const d=Math.sin(x*.015+t)*Math.cos(y*.015-t*.7);const a=d*.5+.5;ctx.fillStyle=`hsla(${(d*180+t*30)%360},60%,60%,${a*.2})`;ctx.beginPath();ctx.arc(x,y,4*a+1,0,Math.PI*2);ctx.fill();}}
            t+=.02;requestAnimationFrame(draw);}draw();
    }
    function initDnaHelix(canvas, ctx) {
        let t=0;const cx=canvas.width/2;
        function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
            const steps=40;for(let i=0;i<steps;i++){const progress=i/steps;const y=i*(canvas.height/steps);const r=80;const x1=cx+Math.sin(progress*Math.PI*4+t)*r;const x2=cx+Math.sin(progress*Math.PI*4+t+Math.PI)*r;const a=progress;ctx.fillStyle=`rgba(0,200,255,.7)`;ctx.beginPath();ctx.arc(x1,y,4,0,Math.PI*2);ctx.fill();ctx.fillStyle=`rgba(255,80,200,.7)`;ctx.beginPath();ctx.arc(x2,y,4,0,Math.PI*2);ctx.fill();if(i%2===0){ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();}}
            t+=.03;requestAnimationFrame(draw);}draw();
    }
    function initRainbowFlow(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<8;i++){ctx.beginPath();for(let x=0;x<=canvas.width;x+=6){const y=canvas.height/2+Math.sin(x*.01+t+i*.4)*100+Math.cos(x*.007-t*.5+i)*50;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.strokeStyle=`hsla(${(i*45+t*25)%360},80%,60%,.4)`;ctx.lineWidth=2;ctx.stroke();}
            t+=.015;requestAnimationFrame(draw);}draw();
    }
    function initColorVortex(canvas, ctx) {
        let t=0;const cx=canvas.width/2,cy=canvas.height/2;
        const pts=Array.from({length:200},()=>({r:Math.random()*300,a:Math.random()*Math.PI*2,speed:0.01+Math.random()*0.02,h:Math.random()*360}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,0,canvas.width,canvas.height);
            pts.forEach(p=>{p.a+=p.speed*(0.5+p.r/600);p.r+=Math.sin(t*2+p.a)*.5;if(p.r<5)p.r=5;if(p.r>350)p.r=Math.random()*50;const x=cx+Math.cos(p.a)*p.r;const y=cy+Math.sin(p.a)*p.r;ctx.fillStyle=`hsla(${(p.h+t*20)%360},80%,60%,.4)`;ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();});
            t+=.01;requestAnimationFrame(draw);}draw();
    }
    function initWaterRipple(canvas, ctx) {
        const ripples=[];let t=0;
        function spawnRipple(){ripples.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:0,maxR:80+Math.random()*120,speed:1.5+Math.random()});}
        function draw(){ctx.fillStyle='rgba(0,0,20,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
            if(Math.random()<.04)spawnRipple();
            for(let i=ripples.length-1;i>=0;i--){const rp=ripples[i];rp.r+=rp.speed;if(rp.r>rp.maxR){ripples.splice(i,1);continue;}const a=1-rp.r/rp.maxR;ctx.strokeStyle=`rgba(100,200,255,${a*.5})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(rp.x,rp.y,rp.r,rp.r*.4,0,0,Math.PI*2);ctx.stroke();}
            t++;requestAnimationFrame(draw);}draw();
    }
    function initLavaBubbles(canvas, ctx) {
        const bubbles=Array.from({length:15},()=>({x:Math.random()*canvas.width,y:canvas.height+Math.random()*200,r:20+Math.random()*60,speed:.4+Math.random()*.8,h:10+Math.random()*40}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
            bubbles.forEach(b=>{b.y-=b.speed;if(b.y<-b.r*2){b.y=canvas.height+b.r;b.x=Math.random()*canvas.width;}const g=ctx.createRadialGradient(b.x-b.r*.3,b.y-b.r*.3,b.r*.1,b.x,b.y,b.r);g.addColorStop(0,`hsla(${b.h},100%,80%,.5)`);g.addColorStop(.7,`hsla(${b.h},100%,50%,.4)`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();});
            requestAnimationFrame(draw);}draw();
    }
    function initQuantum(canvas, ctx) {
        let t=0;
        const pts=Array.from({length:60},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,phase:Math.random()*Math.PI*2,h:Math.random()*360}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
            pts.forEach(p=>{p.phase+=.02;p.x+=p.vx+Math.sin(p.phase)*.5;p.y+=p.vy+Math.cos(p.phase*.7)*.5;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;const sz=4+Math.sin(p.phase)*3;ctx.fillStyle=`hsla(${(p.h+t*10)%360},80%,60%,.5)`;ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);ctx.fill();});
            t+=.01;requestAnimationFrame(draw);}draw();
    }
    function initAcidTrip(canvas, ctx) {
        let t=0;const cx=canvas.width/2,cy=canvas.height/2;
        function draw(){for(let x=0;x<canvas.width;x+=4){for(let y=0;y<canvas.height;y+=4){const d=Math.sqrt((x-cx)**2+(y-cy)**2);const v=Math.sin(d*.03-t*2)+Math.sin(x*.02+t)+Math.cos(y*.02-t*.7);const h=(v*120+t*50)%360;ctx.fillStyle=`hsla(${h},100%,60%,.06)`;ctx.fillRect(x,y,4,4);}}t+=.04;setTimeout(draw,50);}draw();
    }
    function initHearts(canvas, ctx) {
        const hearts=Array.from({length:25},()=>({x:Math.random()*canvas.width,y:canvas.height+Math.random()*100,speed:.4+Math.random()*1.2,size:10+Math.random()*20,drift:(Math.random()-.5)*.3,h:Math.floor(Math.random()*3)*30}));
        function heart(ctx,x,y,size){ctx.beginPath();const t2=Math.PI/4;ctx.moveTo(x,y);ctx.bezierCurveTo(x,y-size*.4,x+size*.6,y-size*.8,x+size*.5,y-size*.3);ctx.bezierCurveTo(x+size,y-size*.2,x+size*.8,y+size*.5,x,y+size*.7);ctx.bezierCurveTo(x-size*.8,y+size*.5,x-size,y-size*.2,x-size*.5,y-size*.3);ctx.bezierCurveTo(x-size*.6,y-size*.8,x,y-size*.4,x,y);ctx.closePath();}
        function draw(){ctx.fillStyle='rgba(0,0,0,.06)';ctx.fillRect(0,0,canvas.width,canvas.height);
            hearts.forEach(h=>{h.y-=h.speed;h.x+=h.drift;if(h.y<-h.size*2){h.y=canvas.height+h.size;h.x=Math.random()*canvas.width;}ctx.fillStyle=`hsla(${h.h+350},70%,65%,.5)`;heart(ctx,h.x,h.y,h.size);ctx.fill();});
            requestAnimationFrame(draw);}draw();
    }
    function initConfettiBg(canvas, ctx) {
        const pieces=Array.from({length:80},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,w:6+Math.random()*8,h:4+Math.random()*6,speed:1+Math.random()*2,drift:(Math.random()-.5)*.5,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.1,h2:Math.random()*360}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(0,0,canvas.width,canvas.height);
            pieces.forEach(p=>{p.y+=p.speed;p.x+=p.drift;p.rot+=p.rotSpeed;if(p.y>canvas.height+10){p.y=-10;p.x=Math.random()*canvas.width;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`hsla(${p.h2},80%,60%,.7)`;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});
            requestAnimationFrame(draw);}draw();
    }
    function initGlitchNoise(canvas, ctx) {
        let t=0;
        function draw(){ctx.fillStyle=c.bg||'#000';ctx.fillRect(0,0,canvas.width,canvas.height);
            const numSlices=Math.floor(Math.random()*8)+1;for(let s=0;s<numSlices;s++){const y=Math.random()*canvas.height;const h=Math.random()*20+2;const shift=(Math.random()-.5)*40;ctx.drawImage(canvas,0,y,canvas.width,h,shift,y,canvas.width,h);}
            if(Math.random()<.3){const y=Math.floor(Math.random()*canvas.height);ctx.fillStyle=`rgba(${Math.random()>0.5?'255,0,0':'0,0,255'},.3)`;ctx.fillRect(0,y,canvas.width,2+Math.random()*5);}
            for(let i=0;i<Math.random()*20;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.3})`;ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*30+2,1);}
            t++;setTimeout(draw,60);}draw();
    }
    function initAbstractFluid(canvas, ctx) {
        let t=0;const pts=Array.from({length:5},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,h:Math.random()*360}));
        function draw(){ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<pts.length;i++){for(let j=i+1;j<pts.length;j++){const p1=pts[i],p2=pts[j];const g=ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);g.addColorStop(0,`hsla(${(p1.h+t*10)%360},80%,60%,.15)`);g.addColorStop(1,`hsla(${(p2.h+t*10)%360},80%,60%,.15)`);ctx.strokeStyle=g;ctx.lineWidth=30+Math.sin(t+i)*10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.quadraticCurveTo((p1.x+p2.x)/2+Math.sin(t+i)*80,(p1.y+p2.y)/2+Math.cos(t+j)*60,p2.x,p2.y);ctx.stroke();}}
            pts.forEach(p=>{p.x+=p.vx+Math.sin(t*.5)*0.5;p.y+=p.vy+Math.cos(t*.4)*0.5;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;});
            t+=.015;requestAnimationFrame(draw);}draw();
    }

    // ─────────────────────────────────────────────────────────
    // EFFECT ENGINES
    // ─────────────────────────────────────────────────────────
    function shuffleText(el, text) {
        const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';let itr=0;
        const iv=setInterval(()=>{el.textContent=text.split('').map((ch,idx)=>idx<itr?text[idx]:chars[Math.floor(Math.random()*chars.length)]).join('');if(itr>=text.length)clearInterval(iv);itr+=.4;},30);
    }
    function enableParallax(img) {
        document.addEventListener('mousemove',e=>{const mx=(e.clientX/window.innerWidth-.5)*20;const my=(e.clientY/window.innerHeight-.5)*20;img.style.transform=`translate(${mx}px,${my}px) scale(1.1)`;});
    }
    function initSnow(density) {
        const c2=document.createElement('canvas');c2.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;';document.body.appendChild(c2);const ctx2=c2.getContext('2d');
        c2.width=window.innerWidth;c2.height=window.innerHeight;
        const fl=Array.from({length:density},()=>({x:Math.random()*c2.width,y:Math.random()*c2.height,r:Math.random()*3+1,s:Math.random()+.5}));
        function draw(){ctx2.clearRect(0,0,c2.width,c2.height);ctx2.fillStyle='rgba(255,255,255,.8)';fl.forEach(f=>{f.y+=f.s;if(f.y>c2.height)f.y=0;ctx2.beginPath();ctx2.arc(f.x,f.y,f.r,0,Math.PI*2);ctx2.fill();});requestAnimationFrame(draw);}draw();
    }
    function initAmbientParticles(color, density) {
        const c2=document.createElement('canvas');c2.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;';document.body.appendChild(c2);const ctx2=c2.getContext('2d');
        c2.width=window.innerWidth;c2.height=window.innerHeight;
        const pts=Array.from({length:density},()=>({x:Math.random()*c2.width,y:Math.random()*c2.height,r:Math.random()*2+.5,vy:-(Math.random()*.5+.2),life:Math.random()}));
        function draw(){ctx2.clearRect(0,0,c2.width,c2.height);pts.forEach(p=>{p.y+=p.vy;p.life-=.003;if(p.life<=0){p.y=c2.height;p.x=Math.random()*c2.width;p.life=1;}ctx2.fillStyle=color;ctx2.globalAlpha=p.life*.6;ctx2.beginPath();ctx2.arc(p.x,p.y,p.r,0,Math.PI*2);ctx2.fill();});ctx2.globalAlpha=1;requestAnimationFrame(draw);}draw();
    }
    function enableRipple() {
        document.addEventListener('click',e=>{const r=document.createElement('div');r.className='ripple';r.style.cssText=`width:20px;height:20px;left:${e.clientX-10}px;top:${e.clientY-10}px;background:${c.accent||'#fff'};opacity:.4;`;document.body.appendChild(r);setTimeout(()=>r.remove(),700);});
    }
    function enableFireworks() {
        document.addEventListener('click',e=>{for(let i=0;i<12;i++){const p=document.createElement('div');const angle=i/12*Math.PI*2,dist=40+Math.random()*40,cx=e.clientX,cy=e.clientY;p.style.cssText=`position:fixed;width:6px;height:6px;border-radius:50%;background:${c.accent||'#fff'};left:${cx}px;top:${cy}px;pointer-events:none;z-index:9997;transition:all .6s ease-out;opacity:1;`;document.body.appendChild(p);setTimeout(()=>{p.style.left=(cx+Math.cos(angle)*dist)+'px';p.style.top=(cy+Math.sin(angle)*dist)+'px';p.style.opacity='0';p.style.transform='scale(0)';},10);setTimeout(()=>p.remove(),700);}});
    }
    function launchConfetti() {
        const colors=['#ff0','#f00','#0f0','#00f','#f0f','#0ff'];
        for(let i=0;i<80;i++){const p=document.createElement('div');const col=colors[i%colors.length];p.style.cssText=`position:fixed;width:${6+Math.random()*6}px;height:${6+Math.random()*6}px;background:${col};left:${Math.random()*100}vw;top:-10px;z-index:9997;border-radius:${Math.random()>.5?'50%':'2px'};animation:cfFall ${1+Math.random()*2}s ${Math.random()*1.5}s ease-in forwards;`;document.body.appendChild(p);setTimeout(()=>p.remove(),4000);}
        const s=document.createElement('style');s.textContent='@keyframes cfFall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}';document.head.appendChild(s);
    }

    // ─────────────────────────────────────────────────────────
    // CURSOR TRAIL ENGINE
    // ─────────────────────────────────────────────────────────
    function spawnTrail(x, y, cur, accent) {
        const t=document.createElement('div');
        t.style.cssText=`position:fixed;pointer-events:none;z-index:9997;left:${x}px;top:${y}px;transform:translate(-50%,-50%);`;
        const type=cur.type, sz=(cur.size||8)+'px', col=cur.color||accent||'#fff';
        let dur=500, anim='';
        switch(type) {
            case 'trail_white': t.style.cssText+=`width:${sz};height:${sz};background:white;border-radius:50%;`; break;
            case 'sparkles': t.innerHTML='✨'; t.style.fontSize=(8+Math.random()*12)+'px'; t.style.transform+=` rotate(${Math.random()*360}deg)`; dur=900; break;
            case 'neon_glow': t.style.cssText+=`width:${sz};height:${sz};background:${col};border-radius:50%;box-shadow:0 0 8px ${col},0 0 16px ${col};`; break;
            case 'liquid': t.style.cssText+=`width:${sz};height:${sz};background:${col};border-radius:50%;filter:blur(3px);`; break;
            case 'blood_drip': t.style.cssText+=`width:5px;height:14px;background:darkred;border-radius:3px;`; break;
            case 'snow': t.innerHTML='❄'; t.style.fontSize=(8+Math.random()*10)+'px'; dur=1200; break;
            case 'heart': t.innerHTML='❤'; t.style.fontSize=(8+Math.random()*10)+'px'; t.style.color='#f55'; dur=800; break;
            case 'star': t.innerHTML='⭐'; t.style.fontSize=(8+Math.random()*10)+'px'; dur=800; break;
            case 'fire': t.innerHTML=['🔥','💥','✨'][Math.floor(Math.random()*3)]; t.style.fontSize=(10+Math.random()*14)+'px'; dur=600; break;
            case 'rainbow':
                const rc='hsl('+Math.random()*360+',100%,60%)';
                t.style.cssText+=`width:${sz};height:${sz};background:${rc};border-radius:50%;box-shadow:0 0 6px ${rc};`; break;
            case 'meteor': t.style.cssText+=`width:${(cur.size||8)*3}px;height:2px;background:linear-gradient(to right,${col},transparent);transform:translate(-50%,-50%) rotate(-45deg);`; dur=300; break;
            case 'butterfly': t.innerHTML=['🦋','🌸','🌺'][Math.floor(Math.random()*3)]; t.style.fontSize=(10+Math.random()*12)+'px'; dur=1000; break;
            case 'electric': t.innerHTML='⚡'; t.style.fontSize=(8+Math.random()*10)+'px'; t.style.color='#ff0'; dur=400; break;
            case 'smoke':
                t.style.cssText+=`width:${20+Math.random()*20}px;height:${20+Math.random()*20}px;background:radial-gradient(circle,rgba(150,150,150,.3),transparent);border-radius:50%;`;dur=1200; break;
            case 'pixel':
                const pc='hsl('+Math.random()*360+',80%,60%)';
                t.style.cssText+=`width:8px;height:8px;background:${pc};image-rendering:pixelated;`; dur=400; break;
            case 'dna':
                t.style.cssText+=`width:4px;height:4px;background:${col};border-radius:50%;transform:translate(-50%,-50%) rotate(${Date.now()*0.1}deg) translateY(10px);`; break;
            case 'emoji': t.innerHTML=cur.customEmoji||'🔥'; t.style.fontSize=(10+Math.random()*8)+'px'; dur=700; break;
            default: return;
        }
        document.body.appendChild(t);
        t.style.transition=`opacity ${dur}ms,transform ${dur}ms`;
        setTimeout(()=>{t.style.opacity='0';t.style.transform+=' scale(0) translateY(-10px)';},10);
        setTimeout(()=>t.remove(),dur);
    }

    // ─────────────────────────────────────────────────────────
    // AUDIO VISUALIZER (Spotify EQ Driver)
    // ─────────────────────────────────────────────────────────
    function initVisualizer(audioEl) {
        let analyser = null;
        let data = null;
        let buf = 0;
        let usingWebAudio = false;

        if (window.location.protocol !== 'file:') {
            try {
                const aC = new (window.AudioContext || window.webkitAudioContext)();
                analyser = aC.createAnalyser();
                const src = aC.createMediaElementSource(audioEl);
                src.connect(analyser);
                analyser.connect(aC.destination);
                analyser.fftSize = 32;
                buf = analyser.frequencyBinCount;
                data = new Uint8Array(buf);
                usingWebAudio = true;
            } catch (e) {
                console.warn('AudioContext failed, falling back to simulation:', e);
            }
        }

        const barCount = 5;
        if (!data) data = new Uint8Array(barCount);

        function frame() {
            requestAnimationFrame(frame);
            const eqBars = document.querySelectorAll('.spotify-eq span');
            if (!eqBars.length) return;

            const isPlaying = !audioEl.paused && !audioEl.ended;

            if (usingWebAudio && isPlaying) {
                analyser.getByteFrequencyData(data);
                for (let i = 0; i < eqBars.length; i++) {
                    const dataIdx = Math.floor(i * (buf / eqBars.length));
                    const val = data[dataIdx] || 0;
                    const barH = Math.max(4, 4 + (val / 255) * 14); // 4px to 18px
                    eqBars[i].style.height = barH + 'px';
                }
            } else {
                for (let i = 0; i < eqBars.length; i++) {
                    if (isPlaying) {
                        const target = Math.abs(Math.sin(i * 0.4 + Date.now() * 0.008)) * 14 + 4 + Math.random() * 2;
                        eqBars[i].style.height = target + 'px';
                    } else {
                        eqBars[i].style.height = '4px';
                    }
                }
            }
        }
        frame();
    }

    // ─────────────────────────────────────────────────────────
    // DRAG AND DROP (IN EDITOR ONLY)
    // ─────────────────────────────────────────────────────────
    if (window.self !== window.top) {
        let draggedEl = null;
        document.querySelectorAll('.el').forEach(el => {
            el.draggable = true;
            el.addEventListener('dragstart', function(e) {
                draggedEl = this;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.innerHTML);
                this.style.opacity = '0.4';
            });
            el.addEventListener('dragend', function() {
                this.style.opacity = '1';
                draggedEl = null;
                const newOrder = Array.from(document.querySelector('.card').querySelectorAll('.el')).map(node => node.id.replace('el-', ''));
                window.parent.postMessage({ type: 'layoutUpdate', layout: newOrder }, '*');
            });
        });
        
        const cardContainer = document.querySelector('.card');
        if (cardContainer) {
            cardContainer.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                return false;
            });
            cardContainer.addEventListener('drop', function(e) {
                e.preventDefault();
                if (draggedEl && e.target !== draggedEl) {
                    let targetEl = e.target.closest('.el');
                    if (targetEl && targetEl !== draggedEl) {
                        const rect = targetEl.getBoundingClientRect();
                        const next = (e.clientY - rect.top)/(rect.bottom - rect.top) > .5;
                        if (next) targetEl.after(draggedEl);
                        else targetEl.before(draggedEl);
                        
                        const dividers = document.querySelectorAll('.section-divider');
                        dividers.forEach(d => d.remove());
                        if (g(cfg, 'sectionDivider.enabled', false)) {
                            const divStyle = g(cfg, 'sectionDivider.style', 'line');
                            const divColor = g(cfg, 'sectionDivider.color', 'rgba(255,255,255,.1)');
                            document.querySelectorAll('.el').forEach((el, i, arr) => {
                                if (i < arr.length - 1 && el.style.display !== 'none') {
                                    const d = document.createElement('div');
                                    d.className = 'section-divider style-' + divStyle;
                                    d.style.background = divColor;
                                    el.after(d);
                                }
                            });
                        }
                    }
                }
                return false;
            });
        }
    }
}
})();
