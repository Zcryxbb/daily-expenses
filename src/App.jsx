import React, { useState, useEffect } from 'react';

export default function App() {
  // สร้าง State เช็คว่าอยู่หน้าแรก (Landing) หรือหน้าแอปหลัก (App)
  const [isStarted, setIsStarted] = useState(false);
  const [isSplitPage, setIsSplitPage] = useState(false);

  // โหลดข้อมูลเก่าจาก LocalStorage (ถ้ามี)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState('');
  const [type, setType] = useState('plus');
  const [amount, setAmount] = useState('');
  const [notice, setNotice] = useState('');
  const [splitTotal, setSplitTotal] = useState('');
  const [splitName, setSplitName] = useState('');
  const [splitPeople, setSplitPeople] = useState([]);

  // บันทึกลง LocalStorage ทุกครั้งที่ข้อมูลเปลี่ยน
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  // คำนวณยอดเงินรวม รายรับ รายจ่าย
  const amounts = transactions.map(t => t.type === 'plus' ? t.amount : -t.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1);
  const splitTotalCents = Math.max(0, Math.round((Number(splitTotal) || 0) * 100));
  const splitBaseCents = splitPeople.length ? Math.floor(splitTotalCents / splitPeople.length) : 0;
  const splitExtraCents = splitPeople.length ? splitTotalCents % splitPeople.length : 0;

  const formatSplitAmount = (cents) => `฿${(cents / 100).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  // ฟังก์ชันเพิ่มรายการ
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!text.trim() || !amount) {
      setNotice('กรุณากรอกชื่อรายการและจำนวนเงินให้ครบถ้วน');
      return;
    }

    setNotice('');
    const newTransaction = {
      id: Date.now(),
      text,
      type,
      amount: parseFloat(amount)
    };

    setTransactions([newTransaction, ...transactions]);
    setText('');
    setAmount('');
  };

  // ฟังก์ชันลบรายการ
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addSplitPerson = (e) => {
    e.preventDefault();
    const name = splitName.trim();
    if (!name) return;

    setSplitPeople([...splitPeople, { id: `${Date.now()}-${Math.random()}`, name }]);
    setSplitName('');
  };

  const removeSplitPerson = (id) => {
    setSplitPeople(splitPeople.filter(person => person.id !== id));
  };

  // 1. หน้าแรกก่อนเข้าแอป (Landing / Welcome Page)
  if (!isStarted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8f9fd] px-5 py-7 text-[#1f2a44] sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border border-[#e4eaf5]" />
        <div className="pointer-events-none absolute -right-20 -top-28 h-[22rem] w-[22rem] rounded-full border border-[#e4eaf5]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col">
          <header className="flex items-center justify-between border-b border-[#e4eaf5] pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbe5ff] text-lg font-semibold text-[#405989]">฿</span>
              <span className="text-sm font-semibold">DAILY EXPENSES</span>
            </div>
          </header>

          <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-16">
            <section className="max-w-xl">
              <h1 className="max-w-lg font-serif text-4xl font-medium leading-[1.08] sm:text-6xl">
                บันทึกรายรับ
                <span className="mt-2 block font-normal text-[#687ca8]">รายจ่าย</span>
              </h1>
            
              <button
                onClick={() => setIsStarted(true)}
                className="group mt-9 inline-flex items-center gap-8 rounded-xl bg-[#dbe5ff] px-6 py-4 text-sm font-semibold text-[#29395c] shadow-lg shadow-[#dbe5ff]/10 transition hover:bg-[#c8d7fb] focus:outline-none focus:ring-2 focus:ring-[#9caee0] focus:ring-offset-2"
              >
                เริ่มบันทึก
                <span aria-hidden="true" className="text-lg text-[#405989] transition-transform group-hover:translate-x-1">→</span>
              </button>
              <p className="mt-4 text-xs text-[#8793aa]">ข้อมูลอยู่บนอุปกรณ์นี้</p>
            </section>

            <section aria-label="ภาพรวมจากข้อมูลการเงินของคุณ" className="relative mx-auto w-full max-w-xl">
              <div className="absolute -left-5 -top-5 h-24 w-24 rounded-full bg-[#ffe6a3] sm:-left-8 sm:-top-8" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full border border-[#e4eaf5]" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#e6ebf5] bg-white shadow-[0_30px_80px_-40px_rgba(124,148,208,0.18)]">
                <div className="relative overflow-hidden bg-[#dbe5ff] px-6 py-7 text-[#29395c] sm:px-8 sm:py-9">
                  <div className="pointer-events-none absolute -right-8 -top-20 h-52 w-52 rounded-full border border-[#cbd7f0]" />
                  <div className="pointer-events-none absolute -right-1 -top-12 h-40 w-40 rounded-full border border-[#cbd7f0]" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#66769a]">ยอดเงินคงเหลือ</p>
                    </div>
                    <p className="mt-3 text-4xl font-semibold sm:text-5xl">฿{total.toLocaleString()}</p>
                  </div>
                </div>

              </div>
            </section>
          </main>

          <footer className="flex items-center justify-between border-t border-[#e4eaf5] pt-4 text-[10px] font-medium uppercase text-[#929eb3]">
            <span>66110548</span>
          </footer>
        </div>
      </div>
    );
  }

  if (isSplitPage) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#f8f9fd] px-4 py-6 text-[#1f2a44] sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf5] pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbe5ff] text-lg font-semibold text-[#405989]">฿</span>
              <div>
                <p className="text-sm font-semibold">DAILY EXPENSES</p>
                <p className="mt-0.5 text-[11px] text-[#8793aa]">หารค่าใช้จ่าย</p>
              </div>
            </div>
            <button
              onClick={() => setIsSplitPage(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#687ca8] transition hover:bg-white hover:text-[#dbe5ff] focus:outline-none focus:ring-2 focus:ring-[#9caee0]"
            >
              ← <span className="hidden sm:inline">กลับหน้ารายรับ-รายจ่าย</span>
            </button>
          </header>

          <div className="mb-7">
          
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">หารค่าใช้จ่ายกับเพื่อน</h1>
          </div>

          <main className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <section className="relative overflow-hidden rounded-2xl bg-[#dbe5ff] p-6 text-[#29395c] shadow-lg shadow-[#dbe5ff]/10 sm:p-8">
                <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border border-[#cbd7f0]" />
                <div className="relative">
                  <p className="text-sm text-[#66769a]">ยอดรวมทั้งหมด</p>
                  <p className="mt-3 text-3xl font-semibold sm:text-5xl">{formatSplitAmount(splitTotalCents)}</p>
                  {splitPeople.length > 0 && splitTotalCents > 0 && (
                    <div className="mt-6 border-t border-[#cbd7f0] pt-4">
                      <p className="text-lg font-semibold text-[#405989]">
                        คนละ {formatSplitAmount(splitBaseCents)}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-5 text-base font-semibold">รายละเอียดบิล</h2>
                <label htmlFor="split-total" className="mb-1.5 block text-xs font-medium text-[#65718a]">ราคาทั้งหมด (บาท)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-[#8793aa]">฿</span>
                  <input
                    id="split-total"
                    type="number"
                    min="0"
                    step="0.01"
                    value={splitTotal}
                    onChange={(e) => setSplitTotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#e4eaf5] bg-[#ffffff] py-3 pl-8 pr-3.5 text-sm placeholder:text-[#929eb3] focus:border-[#9baee3] focus:outline-none focus:ring-2 focus:ring-[#eaf0fc]"
                  />
                </div>

                <form onSubmit={addSplitPerson} className="mt-5">
                  <label htmlFor="split-name" className="mb-1.5 block text-xs font-medium text-[#65718a]">ชื่อเพื่อน</label>
                  <div className="flex gap-2">
                    <input
                      id="split-name"
                      type="text"
                      value={splitName}
                      onChange={(e) => setSplitName(e.target.value)}
                      placeholder="พิมพ์ชื่อแล้วกดเพิ่ม"
                      className="min-w-0 flex-1 rounded-lg border border-[#e4eaf5] bg-[#ffffff] px-3.5 py-3 text-sm placeholder:text-[#929eb3] focus:border-[#9baee3] focus:outline-none focus:ring-2 focus:ring-[#eaf0fc]"
                    />
                    <button type="submit" className="rounded-lg bg-[#dbe5ff] px-4 text-sm font-semibold text-[#29395c] transition hover:bg-[#c8d7fb] focus:outline-none focus:ring-2 focus:ring-[#9caee0] focus:ring-offset-2">
                      เพิ่ม
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <section className="rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold">ส่วนแบ่งต่อคน</h2>
              </div>
              {splitPeople.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center border-t border-[#e9edf5] text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf1fc] text-xl text-[#536da9]">＋</span>
                  <p className="mt-4 text-sm font-medium text-[#53617e]">ยังไม่มีรายชื่อ</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#e9edf5]">
                  {splitPeople.map((person, index) => {
                    const shareCents = splitBaseCents + (index < splitExtraCents ? 1 : 0);
                    return (
                      <li key={person.id} className="flex items-center justify-between gap-4 py-4 first:pt-1">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf1fc] text-sm font-semibold text-[#536da9]">{person.name.charAt(0).toUpperCase()}</span>
                          <span className="truncate text-sm font-medium text-[#3e4d70]">{person.name}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold text-[#566fa9]">{formatSplitAmount(shareCents)}</span>
                          <button
                            type="button"
                            onClick={() => removeSplitPerson(person.id)}
                            className="rounded-md px-2 py-1 text-xs text-[#929eb3] transition hover:bg-[#fff0e9] hover:text-[#a86350]"
                            title={`ลบ ${person.name}`}
                            aria-label={`ลบ ${person.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>
    );
  }

  // 2. หน้าแอปหลัก (Expense Tracker) หลังจากกดเข้าแอปแล้ว
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#f8f9fd] px-4 py-6 text-[#1f2a44] sm:px-6 lg:px-10">
      {notice && (
        <div className="fixed inset-x-4 top-4 z-50 flex justify-center" aria-live="assertive">
          <div role="alert" className="flex w-full max-w-md items-center gap-3 rounded-xl border border-[#ead8c9] bg-[#fffaf5] px-4 py-3 text-[#714a38] shadow-lg shadow-[#1f2a44]/10">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5e7da] text-sm font-semibold">!</span>
            <p className="flex-1 text-sm font-medium">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice('')}
              className="rounded-md px-2 py-1 text-[#9a7966] transition hover:bg-[#f5e7da]"
              aria-label="ปิดการแจ้งเตือน"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf5] pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbe5ff] text-lg font-semibold text-[#405989]">฿</span>
            <div>
              <p className="text-sm font-semibold">DAILY EXPENSES</p>
              <p className="mt-0.5 text-[11px] text-[#8793aa]">บันทึกการเงินส่วนตัว</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSplitPage(true)}
              className="rounded-lg bg-[#eef2fb] px-3 py-2 text-xsnpm install gh-pages --save-dev
 font-semibold text-[#566fa9] transition hover:bg-[#eaf0fc] focus:outline-none focus:ring-2 focus:ring-[#9caee0] sm:text-sm"
            >
              หารค่าใช้จ่าย
            </button>
            <button
              onClick={() => setIsStarted(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#687ca8] transition hover:bg-white hover:text-[#dbe5ff] focus:outline-none focus:ring-2 focus:ring-[#9caee0]"
            >
              ← <span className="hidden sm:inline">หน้าแรก</span>
            </button>
          </div>
        </header>

        <div className="mb-7">
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">บันทึกรายรับ-รายจ่าย</h1>
        </div>

        <main className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-2xl bg-[#dbe5ff] p-6 text-[#29395c] shadow-lg shadow-[#dbe5ff]/10 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border border-[#cbd7f0]" />
              <div className="pointer-events-none absolute -right-5 -top-12 h-40 w-40 rounded-full border border-[#cbd7f0]" />
              <div className="relative">
                <p className="text-sm text-[#66769a]">ยอดเงินคงเหลือทั้งหมด</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">฿{total.toLocaleString()}</h2>
              </div>
            </section>

            <form onSubmit={handleAddTransaction} className="rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-5 text-base font-semibold">เพิ่มรายการใหม่</h3>
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-[#65718a]">ชื่อรายการ</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="เช่น เงินเดือน, ค่าอาหาร..."
                  className="w-full rounded-lg border border-[#e4eaf5] bg-[#ffffff] px-3.5 py-3 text-sm placeholder:text-[#929eb3] focus:border-[#9baee3] focus:outline-none focus:ring-2 focus:ring-[#eaf0fc]"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-[#65718a]">ประเภท</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-[#e4eaf5] bg-[#ffffff] px-3.5 py-3 text-sm focus:border-[#9baee3] focus:outline-none focus:ring-2 focus:ring-[#eaf0fc]"
                >
                  <option value="plus">รายรับ</option>
                  <option value="minus">รายจ่าย</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-medium text-[#65718a]">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[#e4eaf5] bg-[#ffffff] px-3.5 py-3 text-sm placeholder:text-[#929eb3] focus:border-[#9baee3] focus:outline-none focus:ring-2 focus:ring-[#eaf0fc]"
                />
              </div>
              <button type="submit" className="w-full rounded-lg bg-[#dbe5ff] py-3 text-sm font-semibold text-[#29395c] transition hover:bg-[#c8d7fb] focus:outline-none focus:ring-2 focus:ring-[#9caee0] focus:ring-offset-2">
                บันทึกรายการ
              </button>
            </form>
          </div>

          <section className="rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold">ประวัติรายการ</h3>
              <span className="text-xs text-[#8793aa]">{transactions.length} รายการ</span>
            </div>
            {transactions.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center border-t border-[#e9edf5] text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf1fc] text-xl text-[#536da9]">฿</span>
                <p className="mt-4 text-sm font-medium text-[#53617e]">ยังไม่มีรายการบันทึก</p>
                <p className="mt-1 text-xs text-[#929eb3]">รายการที่เพิ่มจะแสดงที่นี่</p>
              </div>
            ) : (
              <ul className="max-h-[34rem] divide-y divide-[#e9edf5] overflow-y-auto">
                {transactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 py-4 first:pt-1">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${t.type === 'plus' ? 'bg-[#edf1fc] text-[#536da9]' : 'bg-[#fff0e9] text-[#a86350]'}`}>
                        {t.type === 'plus' ? '↙' : '↗'}
                      </span>
                      <span className="truncate text-sm font-medium text-[#3e4d70]">{t.text}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`text-sm font-semibold ${t.type === 'plus' ? 'text-[#536da9]' : 'text-[#a86350]'}`}>
                        {t.type === 'plus' ? '+' : '−'}฿{Math.abs(t.amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="rounded-md px-2 py-1 text-xs text-[#929eb3] transition hover:bg-[#fff0e9] hover:text-[#a86350]"
                        title="ลบรายการ"
                        aria-label={`ลบรายการ ${t.text}`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

      </div>
    </div>
  );
}