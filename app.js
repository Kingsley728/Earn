// Facebook SDK initialization
window.fbAsyncInit = function() {
  FB.init({
    appId      : 'YOUR_FACEBOOK_APP_ID', // Replace with your real Facebook App ID
    cookie     : true,
    xfbml      : false,
    version    : 'v17.0'
  });
};

const loginContainer = document.getElementById('login-container');
const pages = {
  balance: document.getElementById('page-balance'),
  earn: document.getElementById('page-earn'),
  withdraw: document.getElementById('page-withdraw'),
};

const navButtons = {
  balance: document.getElementById('nav-balance'),
  earn: document.getElementById('nav-earn'),
  withdraw: document.getElementById('nav-withdraw'),
  logout: document.getElementById('nav-logout'),
};

const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const fbLoginBtn = document.getElementById('fb-login-btn');
const emailLoginBtn = document.getElementById('email-login-btn');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const registerBtn = document.getElementById('register-btn');
const regEmailInput = document.getElementById('reg-email-input');
const regPasswordInput = document.getElementById('reg-password-input');

const balanceAmountEl = document.getElementById('balance-amount');
const referralLinkInput = document.getElementById('referral-link');
const copyReferralBtn = document.getElementById('copy-referral-btn');
const userLevelEl = document.getElementById('user-level');
const inviteCountEl = document.getElementById('invite-count');

const followFacebookBtn = document.getElementById('follow-facebook-btn');
const followTwitterBtn = document.getElementById('follow-twitter-btn');
const followYoutubeBtn = document.getElementById('follow-youtube-btn');
const twitterLikeBtn = document.getElementById('twitter-like-btn');
const inviteBtn = document.getElementById('invite-btn');

const withdrawForm = document.getElementById('withdraw-form');
const withdrawAmountInput = document.getElementById('withdraw-amount');
const withdrawMethodSelect = document.getElementById('withdraw-method');
const accountDetailsInput = document.getElementById('account-details');

const taskVideosContainer = document.getElementById('task-videos');

const storageKey = 'earnify_users';
const loginStorageKey = 'earnify_logged_in';
let currentUser = null;

// Helper functions for localStorage
function getUsers() {
  const str = localStorage.getItem(storageKey);
  return str ? JSON.parse(str) : {};
}
function saveUsers(users) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}
function saveCurrentUser(user) {
  localStorage.setItem(loginStorageKey, user.email);
}
function getCurrentUser() {
  const email = localStorage.getItem(loginStorageKey);
  if (!email) return null;
  const users = getUsers();
  return users[email] || null;
}
function updateUser(user) {
  const users = getUsers();
  users[user.email] = user;
  saveUsers(users);
}
function logoutUser() {
  localStorage.removeItem(loginStorageKey);
  currentUser = null;
}
function clearInputs() {
  emailInput.value = '';
  passwordInput.value = '';
  regEmailInput.value = '';
  regPasswordInput.value = '';
}

function showLogin() {
  loginContainer.style.display = 'block';
  Object.values(pages).forEach(p=>p.hidden=true);
  Object.values(navButtons).forEach(btn => btn.style.display='none');
  clearInputs();
  loginPage.hidden = false;
  registerPage.hidden = true;
}
function showRegister() {
  loginContainer.style.display = 'block';
  Object.values(pages).forEach(p=>p.hidden=true);
  Object.values(navButtons).forEach(btn => btn.style.display='none');
  clearInputs();
  loginPage.hidden = true;
  registerPage.hidden = false;
}
function showPage(name) {
  loginContainer.style.display = 'none';
  Object.keys(pages).forEach(key => pages[key].hidden = (key !== name));
  Object.values(navButtons).forEach(btn => btn.style.display='inline-block');
  setActiveNav(name);
}
function setActiveNav(name) {
  Object.keys(navButtons).forEach(key => {
    const isActive = key === name;
    navButtons[key].classList.toggle('active', isActive);
    navButtons[key].setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function generateReferralLink(email) {
  const base = window.location.origin || 'https://earnify.example.com';
  return `${base}/?ref=${encodeURIComponent(email)}`;
}
function refreshUserUI() {
  if(!currentUser) return;
  balanceAmountEl.textContent = currentUser.balance.toLocaleString();
  userLevelEl.textContent = currentUser.level || 1;
  inviteCountEl.textContent = currentUser.invites || 0;
  referralLinkInput.value = generateReferralLink(currentUser.email);

  followFacebookBtn.disabled = currentUser.followedFacebook || false;
  followTwitterBtn.disabled = currentUser.followedTwitter || false;
  followYoutubeBtn.disabled = currentUser.followedYoutube || false;
  twitterLikeBtn.disabled = currentUser.likedRetweetedTwitter || false;
}
function tryClaimLoginBonus() {
  if(!currentUser) return;
  const lastBonus = currentUser.lastLoginBonus || 0;
  let now = Date.now();
  if(now - lastBonus >= 86400000) {
    currentUser.balance += 1000;
    currentUser.lastLoginBonus = now;
    updateUser(currentUser);
    refreshUserUI();
    alert('🎉 Daily login bonus ₦1000 credited!');
  }
}

// Attach event listeners
fbLoginBtn.onclick = () => {
  FB.login(response => {
    if(response.authResponse) {
      FB.api('/me', {fields:'id,name,email'}, user => {
        let email = user.email || `${user.id}@fb.fake`;
        let users = getUsers();
        if(!users[email]) {
          users[email] = {
            email,
            password: '',
            balance: 1000,
            invites: 0,
            level: 1,
            lastLoginBonus: 0,
            followedFacebook: false,
            followedTwitter: false,
            followedYoutube: false,
            likedRetweetedTwitter: false,
            videoWatched: {}
          };
          saveUsers(users);
        }
        currentUser = users[email];
        saveCurrentUser(currentUser);
        showPage('balance');
        refreshUserUI();
        tryClaimLoginBonus();
      });
    } else alert('Facebook login failed or cancelled.');
  }, {scope:'email,public_profile'});
};
emailLoginBtn.onclick = () => {
  let email = emailInput.value.trim().toLowerCase();
  let pwd = passwordInput.value;
  let users = getUsers();
  if(!users[email]) return alert('User not found, please register.');
  if(users[email].password !== pwd) return alert('Incorrect password.');
  currentUser = users[email];
  saveCurrentUser(currentUser);
  showPage('balance');
  refreshUserUI();
  tryClaimLoginBonus();
};
registerBtn.onclick = () => {
  let email = regEmailInput.value.trim().toLowerCase();
  let pwd = regPasswordInput.value;
  if(!email || !pwd) return alert('Please enter email and password.');
  let users = getUsers();
  if(users[email]) return alert('User exists. Please login.');
  users[email] = {
    email,
    password: pwd,
    balance: 1000,
    invites: 0,
    level: 1,
    lastLoginBonus: 0,
    followedFacebook: false,
    followedTwitter: false,
    followedYoutube: false,
    likedRetweetedTwitter: false,
    videoWatched: {}
  };
  saveUsers(users);
  alert('Registration successful! Please login.');
  showLogin();
};
showRegisterLink.onclick = () => showRegister();
showLoginLink.onclick = () => showLogin();
logoutBtn.onclick = () => {
  logoutUser();
  currentUser = null;
  showLogin();
};
navButtons.balance.onclick = () => showPage('balance');
navButtons.earn.onclick = () => showPage('earn');
navButtons.withdraw.onclick = () => showPage('withdraw');
navButtons.logout.onclick = logoutBtn.onclick;
copyReferralBtn.onclick = () => {
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    navigator.clipboard.writeText(referralLinkInput.value).then(() => alert('Referral link copied!'), () => alert('Failed to copy referral link.'));
  } else {
    // fallback
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999);
    if(document.execCommand('copy')) alert('Referral link copied!');
    else alert('Failed to copy referral link.');
  }
};
function followEarn(platform, url, key, amount, btn) {
  if(currentUser[key]) {
    alert(`You already earned ₦${amount.toLocaleString()} for following ${platform}.`);
    return;
  }
  window.open(url, '_blank');
  if(confirm(`Confirm you followed our ${platform} page to earn ₦${amount.toLocaleString()}.`)) {
    currentUser.balance += amount;
    currentUser[key] = true;
    updateUser(currentUser);
    refreshUserUI();
    alert('🎉 Earned ₦' + amount.toLocaleString());
    btn.disabled = true;
  }
}
followFacebookBtn.onclick = () => followEarn('Facebook', 'https://www.facebook.com/share/1CQTgX1XFw/?mibextid=qi2Omg', 'followedFacebook', 5000, followFacebookBtn);
followTwitterBtn.onclick = () => followEarn('Twitter', 'https://twitter.com/youraccount', 'followedTwitter', 5000, followTwitterBtn);
followYoutubeBtn.onclick = () => followEarn('YouTube', 'https://youtube.com/@learnwithugo', 'followedYoutube', 5000, followYoutubeBtn);
twitterLikeBtn.onclick = () => {
  if(currentUser.likedRetweetedTwitter) {
    alert('Already earned for liking & retweeting.');
    return;
  }
  window.open('https://twitter.com/youraccount/status/1234567890', '_blank');
  if(confirm('Confirm you liked & retweeted our Twitter post to earn ₦500.')) {
    currentUser.balance += 500;
    currentUser.likedRetweetedTwitter = true;
    updateUser(currentUser);
    refreshUserUI();
    alert('🎉 Earned ₦500');
    twitterLikeBtn.disabled = true;
  }
};
const FIVE_MINUTES = 5 * 60 * 1000;
let videoTimers = {};
let videoStatus = {};
function startWatchTimer(videoId, btn) {
  if(videoStatus[videoId]) {
    alert('Video already watched.');
    return;
  }
  if(videoTimers[videoId]) {
    alert('Already watching this video.');
    return;
  }
  alert('Watch video for 5 minutes to earn ₦500.');
  btn.disabled = true;
  videoTimers[videoId] = setTimeout(() => {
    currentUser.balance += 500;
    currentUser.videoWatched[videoId] = true;
    videoStatus[videoId] = true;
    updateUser(currentUser);
    refreshUserUI();
    alert('🎉 Earned ₦500 for watching the video!');
    btn.disabled = true;
    delete videoTimers[videoId];
  }, FIVE_MINUTES);
}
function attachVideoButtons() {
  document.querySelectorAll('.watch-video-btn').forEach(btn => {
    btn.addEventListener('click', () => startWatchTimer(btn.getAttribute('data-video-id'), btn));
  });
}
attachVideoButtons();
inviteBtn.onclick = () => {
  if(currentUser.level >= 10) {
    alert('Max level 10 reached.');
    return;
  }
  const friendEmail = prompt('Enter email address friend to invite:');
  if(!friendEmail || !friendEmail.includes('@')) {
    alert('Enter a valid email.');
    return;
  }
  currentUser.invites = (currentUser.invites || 0) + 1;
  currentUser.balance += 800;
  const newLevel = Math.min(10, Math.floor(currentUser.invites / 5) + 1);
  if(newLevel !== currentUser.level) {
    currentUser.level = newLevel;
    alert(`🎉 Level Up! You are now level ${newLevel}`);
  } else {
    alert('🎉 Invite successful! ₦800 credited.');
  }
  updateUser(currentUser);
  refreshUserUI();
};
withdrawForm.onsubmit = e => {
  e.preventDefault();
  if(!currentUser) {
    alert('Please login first.');
    return;
  }
  const amount = Number(withdrawAmountInput.value);
  const method = withdrawMethodSelect.value;
  const details = accountDetailsInput.value.trim();
  if(!amount || amount < 250000) {
    alert('Minimum withdrawal amount is ₦250,000.');
    return;
  }
  if(amount > currentUser.balance) {
    alert('Insufficient balance.');
    return;
  }
  if(!method) {
    alert('Please select a withdrawal method.');
    return;
  }
  if(details.length < 3) {
    alert('Please enter valid account details.');
    return;
  }
  currentUser.balance -= amount;
  updateUser(currentUser);
  refreshUserUI();
  alert(`Withdrawal request of ₦${amount.toLocaleString()} via ${method} received. Processing: up to 7 days.`);
  withdrawForm.reset();
  showPage('balance');
};

document.getElementById('goto-withdraw-btn').onclick = () => showPage('withdraw');
document.getElementById('goto-earn-btn').onclick = () => showPage('earn');

function init() {
  currentUser = getCurrentUser();
  // Check for referral in URL
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if(ref) {
    // Store referral if not already stored for new visitors (you can expand this logic as needed)
    localStorage.setItem('earnify_referral', ref);
  }
  if(currentUser) {
    showPage('balance');
    refreshUserUI();
    tryClaimLoginBonus();
    logoutBtn.style.display = 'inline-block';
    Object.values(navButtons).forEach(btn => btn.style.display = 'inline-block');
  } else {
    showLogin();
    logoutBtn.style.display = 'none';
    Object.values(navButtons).forEach(btn => btn.style.display = 'none');
  }
}

document.addEventListener('DOMContentLoaded', init);
