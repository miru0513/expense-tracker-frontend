const localStore = { basic: [], trips: {} };
const queue = [];
let _onSyncCallback = null;

export const getLocalTransactions = (storageKey = 'basic') => {
  if (storageKey === 'basic') return [...(localStore.basic || [])];
  return [...(localStore.trips[storageKey] || [])];
};

const setLocalTransactions = (storageKey, transactions) => {
  if (storageKey === 'basic') { localStore.basic = transactions; }
  else { localStore.trips[storageKey] = transactions; }
};

export const addLocalTransaction = (transaction, storageKey = 'basic') => {
  setLocalTransactions(storageKey, [...getLocalTransactions(storageKey), transaction]);
};

export const updateLocalTransaction = (updated, storageKey = 'basic') => {
  setLocalTransactions(storageKey, getLocalTransactions(storageKey).map((t) => (t.id === updated.id ? updated : t)));
};

export const deleteLocalTransaction = (id, storageKey = 'basic') => {
  setLocalTransactions(storageKey, getLocalTransactions(storageKey).filter((t) => t.id !== id));
};

export const enqueue = (operation) => { queue.push({ ...operation, queuedAt: Date.now() }); };
export const getQueue = () => [...queue];
export const getQueueLength = () => queue.length;
export const onSync = (callback) => { _onSyncCallback = callback; };

const cleanBody = (body) => {
  const { type, title, amount, category, date, tripId, userId } = body;
  return { type, title, amount, category, date, tripId: tripId || null, userId: userId || null };
};

export const flushQueue = async (apiFunctions) => {
  if (queue.length === 0) return;
  console.log(`[Sync] Flushing ${queue.length} queued operations...`);
  const toProcess = [...queue];
  queue.length = 0;
  for (const op of toProcess) {
    try {
      if (op.method === 'POST') await apiFunctions.createTransaction(cleanBody(op.body));
      else if (op.method === 'PUT') await apiFunctions.updateTransaction(op.targetId, cleanBody(op.body));
      else if (op.method === 'DELETE') await apiFunctions.deleteTransaction(op.targetId);
      console.log(`[Sync] ✓ ${op.method} synced`);
    } catch (err) {
      console.warn(`[Sync] ✗ Failed to sync, re-queuing`, err);
      queue.push(op);
    }
  }
  if (_onSyncCallback) _onSyncCallback();
};