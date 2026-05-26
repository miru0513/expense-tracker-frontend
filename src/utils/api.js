const _viaProxy   = !import.meta.env.VITE_API_HOST && window.location.hostname === 'localhost';
const BASE_HOST    = import.meta.env.VITE_API_HOST
  || (_viaProxy ? `localhost:${window.location.port || 5173}` : '10.166.91.149:3001');
const _http        = _viaProxy ? 'http'  : 'https';
const _ws          = _viaProxy ? 'ws'    : 'wss';
const GRAPHQL_URL  = `${_http}://${BASE_HOST}/graphql`;
const HEALTH_URL   = `${_http}://${BASE_HOST}/api/health`;
export const WS_URL      = `${_ws}://${BASE_HOST}/ws`;
export const CHAT_WS_URL = `${_ws}://${BASE_HOST}/chat`;

// ── Token management (in-memory + sessionStorage for tab persistence) ─────────
// Stored in memory (XSS-safe) and mirrored to sessionStorage for tab refresh.
let _token = null;

const TOKEN_KEY = 'ss_auth_token';

export const setAuthToken = (token) => {
  _token = token;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else        sessionStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = () => {
  if (_token) return _token;
  // Restore from sessionStorage on first load after tab refresh
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (stored) { _token = stored; }
  return _token;
};

export const clearAuthToken = () => setAuthToken(null);

// ── GraphQL client ─────────────────────────────────────────────────────────────
const gql = async (query, variables = {}) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
};

export const isServerReachable = async () => {
  try {
    const res = await fetch(`${HEALTH_URL}?t=${Date.now()}`, { signal: AbortSignal.timeout(3000), cache: 'no-store' });
    return res.ok || res.status === 304;
  } catch { return false; }
};

// ── Transactions ───────────────────────────────────────────────────────────────
export const fetchTransactions = async (page = 1, limit = 5, tripId = null, userId = null) => {
  const data = await gql(`
    query GetTransactions($page: Int, $limit: Int, $tripId: String, $userId: String) {
      transactions(page: $page, limit: $limit, tripId: $tripId, userId: $userId) {
        data { id type title amount category date tripId userId }
        pagination { total page limit totalPages }
      }
    }
  `, { page, limit, tripId, userId });
  return data.transactions;
};

export const fetchStatistics = async (tripId = null, userId = null) => {
  const data = await gql(`
    query GetStats($tripId: String, $userId: String) {
      statistics(tripId: $tripId, userId: $userId) {
        totalIncome totalExpense balance avgExpense transactionCount
        byCategory { category total }
      }
    }
  `, { tripId, userId });
  return data.statistics;
};

export const createTransaction = async (tx) => {
  const { type, title, amount, category, date, tripId } = tx;
  const data = await gql(`
    mutation CreateTransaction($type:String!,$title:String!,$amount:Float!,$category:String!,$date:String!,$tripId:String){
      createTransaction(type:$type,title:$title,amount:$amount,category:$category,date:$date,tripId:$tripId){
        id type title amount category date tripId userId
      }
    }
  `, { type, title, amount, category, date, tripId: tripId || null });
  return data.createTransaction;
};

export const updateTransaction = async (id, tx) => {
  const { type, title, amount, category, date, tripId } = tx;
  const data = await gql(`
    mutation UpdateTransaction($id:ID!,$type:String!,$title:String!,$amount:Float!,$category:String!,$date:String!,$tripId:String){
      updateTransaction(id:$id,type:$type,title:$title,amount:$amount,category:$category,date:$date,tripId:$tripId){
        id type title amount category date tripId userId
      }
    }
  `, { id, type, title, amount, category, date, tripId: tripId || null });
  return data.updateTransaction;
};

export const deleteTransaction = async (id) => {
  await gql(`mutation DeleteTransaction($id:ID!){ deleteTransaction(id:$id) }`, { id });
};

// ── Trips ──────────────────────────────────────────────────────────────────────
export const fetchTrips = async (userId = null) => {
  const data = await gql(`
    query($userId:String){ trips(userId:$userId){ data{ id name icon date userId } pagination{ total page limit totalPages } } }
  `, { userId });
  return data.trips;
};

export const createTrip = async ({ name, icon }) => {
  const data = await gql(`
    mutation CreateTrip($name:String!,$icon:String){
      createTrip(name:$name,icon:$icon){ id name icon date userId }
    }
  `, { name, icon });
  return data.createTrip;
};

export const deleteTrip = async (id) => {
  await gql(`mutation DeleteTrip($id:ID!){ deleteTrip(id:$id) }`, { id });
};

export const updateTrip = async (id, { name, icon }) => {
  const data = await gql(`
    mutation($id:ID!,$name:String,$icon:String){ updateTrip(id:$id,name:$name,icon:$icon){ id name icon date } }
  `, { id, name, icon });
  return data.updateTrip;
};

// ── Generator ──────────────────────────────────────────────────────────────────
export const startGenerator = async (batchSize = 3, intervalMs = 2000, tripId = null, userId = null) => {
  const data = await gql(`
    mutation StartGenerator($batchSize:Int,$intervalMs:Int,$tripId:String,$userId:String){
      startGenerator(batchSize:$batchSize,intervalMs:$intervalMs,tripId:$tripId,userId:$userId){ started message }
    }
  `, { batchSize, intervalMs, tripId, userId });
  return data.startGenerator;
};

export const stopGenerator = async () => {
  const data = await gql(`mutation{ stopGenerator{ stopped message } }`);
  return data.stopGenerator;
};

export const fetchGeneratorStatus = async () => {
  const data = await gql(`query{ generatorStatus{ running } }`);
  return data.generatorStatus;
};

// ── Auth ───────────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const data = await gql(`
    mutation($email:String!,$password:String!){
      login(email:$email,password:$password){
        success message pendingToken
      }
    }
  `, { email, password });
  return data.login;
};

export const verifyLoginCode = async (pendingToken, code) => {
  const data = await gql(`
    mutation($pendingToken:String!,$code:String!){
      verifyLoginCode(pendingToken:$pendingToken,code:$code){
        success message pendingToken securityQuestion
        user{ id name email isActive createdAt role{ id name permissions{ name } } }
        token
      }
    }
  `, { pendingToken, code });
  return data.verifyLoginCode;
};

export const verifySecurityQuestion = async (pendingToken, answer) => {
  const data = await gql(`
    mutation($pendingToken:String!,$answer:String!){
      verifySecurityQuestion(pendingToken:$pendingToken,answer:$answer){
        success message
        user{ id name email isActive createdAt role{ id name permissions{ name } } }
        token
      }
    }
  `, { pendingToken, answer });
  return data.verifySecurityQuestion;
};

export const registerUser = async (name, email, password, securityQuestion, securityAnswer) => {
  const data = await gql(`
    mutation($name:String!,$email:String!,$password:String!,$securityQuestion:String,$securityAnswer:String){
      register(name:$name,email:$email,password:$password,securityQuestion:$securityQuestion,securityAnswer:$securityAnswer){
        success message token
        user{ id name email role{ id name permissions{ name } } }
      }
    }
  `, { name, email, password, securityQuestion, securityAnswer });
  return data.register;
};

// ── Sessions ───────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  try { await gql(`mutation { logout }`); } catch { /* revoke best-effort */ }
  clearAuthToken();
};

export const fetchMySessions = async () => {
  const data = await gql(`{ mySessions { id userId name permissions expiresAt isRevoked ipAddress createdAt } }`);
  return data.mySessions;
};

export const fetchAllSessions = async () => {
  const data = await gql(`{ allSessions { id userId name permissions expiresAt isRevoked ipAddress createdAt } }`);
  return data.allSessions;
};

export const revokeSession = async (sessionId) => {
  const data = await gql(`mutation($id:ID!){ revokeSession(sessionId:$id) }`, { id: sessionId });
  return data.revokeSession;
};

export const revokeAllSessions = async () => {
  const data = await gql(`mutation{ revokeAllSessions }`);
  return data.revokeAllSessions;
};

export const generateToken = async (name, permissions, expiresIn) => {
  const data = await gql(`
    mutation($name:String!,$permissions:[String!]!,$expiresIn:String){
      generateToken(name:$name,permissions:$permissions,expiresIn:$expiresIn){
        token sessionId name permissions expiresAt
      }
    }
  `, { name, permissions, expiresIn });
  return data.generateToken;
};

// ── Admin ──────────────────────────────────────────────────────────────────────
export const fetchUsers = async () => {
  const data = await gql(`{ users{ id name email isActive createdAt role{ name permissions{ name } } } }`);
  return data.users;
};

export const fetchRoles = async () => {
  const data = await gql(`{ roles{ id name description permissions{ id name description } } }`);
  return data.roles;
};

export const fetchMyPermissions = async (userId) => {
  const data = await gql(`query($userId:ID!){ myPermissions(userId:$userId) }`, { userId });
  return data.myPermissions;
};

export const updateUserRole = async (userId, roleName) => {
  const data = await gql(`
    mutation($userId:ID!,$roleName:String!){ updateUserRole(userId:$userId,roleName:$roleName){ id name email role{ name } } }
  `, { userId, roleName });
  return data.updateUserRole;
};

export const fetchLogs = async (limit = 100) => {
  const data = await gql(`
    query($limit:Int){ logs(limit:$limit){ id userId userEmail userRole action details ipAddress success timestamp } }
  `, { limit });
  return data.logs;
};

export const fetchSuspiciousUsers = async () => {
  const data = await gql(`{
    suspiciousUsers{ id userId userEmail userRole reason actionCount detectedAt resolved }
  }`);
  return data.suspiciousUsers;
};

export const resolveFlag = async (id) => {
  const data = await gql(`
    mutation($id:ID!){ resolveFlag(id:$id){ id resolved } }
  `, { id });
  return data.resolveFlag;
};
