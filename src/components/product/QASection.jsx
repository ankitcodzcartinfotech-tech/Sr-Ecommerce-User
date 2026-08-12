"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, MessageCircle, Plus, Send,
  ThumbsUp, Loader2, HelpCircle, X,
} from "lucide-react";
import { getQuestions, askQuestion, answerQuestion, upvoteAnswer } from "@/Api/AllApi";
import ValidatedInput from "@/components/common/ValidatedInput";

/* ─── helpers ─────────────────────────────────────────────── */
const isLoggedIn = () =>
  typeof window !== "undefined" && !!localStorage.getItem("userToken");

function Avatar({ name, size = "sm" }) {
  const initials = (name || "?").charAt(0).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${cls}`}
      style={{ background: `hsl(${hue},45%,52%)` }}
    >
      {initials}
    </div>
  );
}

function AnswerItem({ ans, onUpvote }) {
  const name    = ans.user?.name || ans.admin?.name || "Team Keshrag";
  const isAdmin = !!ans.admin;
  const upvotes = ans.upvotes?.length || 0;

  return (
    <div className="flex gap-3">
      <Avatar name={name} />
      <div className="flex-1 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-(--text)">{name}</p>
            {isAdmin && (
              <span className="rounded-full bg-(--gold) px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                Official
              </span>
            )}
          </span>
          <p className="text-[10px] text-(--muted)">
            {new Date(ans.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <p className="mt-1.5 text-sm leading-6 text-(--muted)">{ans.answer}</p>
        {/* Upvote */}
        <button
          type="button"
          onClick={() => onUpvote?.(ans._id)}
          className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-(--muted) transition-colors hover:text-(--gold) cursor-pointer"
        >
          <ThumbsUp size={11} />
          {upvotes > 0 ? `Helpful (${upvotes})` : "Helpful?"}
        </button>
      </div>
    </div>
  );
}

function QuestionItem({ question }) {
  const [open, setOpen]             = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers]       = useState(question.answers || []);
  const [err, setErr]               = useState("");

  async function handleAnswer(e) {
    e.preventDefault();
    if (!answerText.trim()) return;
    if (!isLoggedIn()) { setErr("Please login to answer."); return; }
    setSubmitting(true);
    try {
      const data = await answerQuestion(question._id, { answer: answerText.trim() });
      // Backend returns the full updated question with all answers
      const updatedAnswers = data?.data?.answers || data?.answers || [];
      if (updatedAnswers.length > 0) {
        setAnswers(updatedAnswers);
      } else {
        // Fallback: optimistic
        setAnswers(prev => [...prev, {
          _id: Date.now().toString(),
          answer: answerText.trim(),
          user: { name: "You" },
          upvotes: [],
          createdAt: new Date().toISOString(),
        }]);
      }
      setAnswerText("");
      setErr("");
    } catch (ex) {
      setErr(ex.message || "Could not post answer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpvote(answerId) {
    if (!isLoggedIn()) { setErr("Please login to vote."); return; }
    try {
      const data = await upvoteAnswer(answerId);
      const updated = data?.data?.answers || data?.answers;
      if (updated) setAnswers(updated);
    } catch { /* silent */ }
  }

  const answerCount = answers.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-(--border) bg-white transition-shadow hover:shadow-sm">
      {/* Question header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left cursor-pointer"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--gold-soft)">
          <HelpCircle size={14} className="text-(--gold)" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-(--text)">{question.question}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-(--muted)">
            <span>{question.user?.name || "Customer"}</span>
            <span>·</span>
            <span>
              {new Date(question.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
            {answerCount > 0 && (
              <>
                <span>·</span>
                <span className="font-semibold text-(--gold)">
                  {answerCount} answer{answerCount > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="mt-1 shrink-0">
          <ChevronDown size={15} className="text-(--muted)" />
        </motion.div>
      </button>
      {/* Expanded answers + reply */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-(--border) px-5 pb-5 pt-4 space-y-3">
              {/* Answers */}
              {answers.length > 0 ? (
                answers.map((ans, i) => (
                  <AnswerItem key={ans._id || i} ans={ans} onUpvote={handleUpvote} />
                ))
              ) : (
                <p className="py-2 text-sm italic text-(--muted)">
                  No answers yet — be the first to help!
                </p>
              )}

              {/* Answer form */}
              {isLoggedIn() ? (
                <form onSubmit={handleAnswer} className="flex gap-2 pt-1">
                  <div className="flex-1">
                    <ValidatedInput
                      value={answerText}
                      onChange={e => { setAnswerText(e.target.value); setErr(""); }}
                      placeholder="Write your answer…"
                      className="w-full"
                      inputClassName="rounded-full h-[40px] px-4 py-2 text-sm bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !answerText.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--gold) text-white transition-all hover:bg-(--text) disabled:opacity-50 cursor-not-allowed"
                  >
                    {submitting
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Send size={14} />}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-(--muted)">
                  <a href="/login" className="font-semibold text-(--gold) hover:underline cursor-pointer">Login</a> to post an answer.
                </p>
              )}
              {err && <p className="text-xs text-rose-500">{err}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main section ────────────────────────────────────────── */
export default function QASection({ productId }) {
  const [questions, setQuestions]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [err, setErr]                 = useState("");

  useEffect(() => {
    if (!productId) return;
    getQuestions(productId, { limit: 20 })
      .then(d => {
        // Backend returns { data: [...] } — not { questions: [...] }
        const list = d?.data || d?.questions || [];
        setQuestions(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAskQuestion(e) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    if (!isLoggedIn()) { setErr("Please login to ask a question."); return; }
    setSubmitting(true);
    try {
      const data = await askQuestion(productId, { question: newQuestion.trim() });
      const q = data?.data || data?.question || {
        question: newQuestion.trim(),
        _id: Date.now().toString(),
        answers: [],
        createdAt: new Date().toISOString(),
        user: { name: "You" },
      };
      setQuestions(prev => [q, ...prev]);
      setNewQuestion("");
      setShowForm(false);
      setErr("");
    } catch (ex) {
      setErr(ex.message || "Could not post question");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 border-t border-(--border) pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-(--text)">Questions & Answers</h3>
          <p className="mt-0.5 text-xs text-(--muted)">
            {loading
              ? "Loading…"
              : questions.length > 0
              ? `${questions.length} question${questions.length !== 1 ? "s" : ""} from customers`
              : "Be the first to ask about this product"}
          </p>
        </div>
        {isLoggedIn() && (
          <button
            type="button"
            onClick={() => setShowForm(v => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
              showForm
                ? "border-rose-300 bg-rose-50 text-rose-600"
                : "border-(--gold) text-(--gold) hover:bg-(--gold) hover:text-white"
            } cursor-pointer`}
          >
            {showForm ? <><X size={12} /> Cancel</> : <><Plus size={12} /> Ask a Question</>}
          </button>
        )}
      </div>
      {/* Ask question form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="mb-5 overflow-hidden"
          >
            <form
              onSubmit={handleAskQuestion}
              className="rounded-2xl border border-(--border) bg-(--surface) p-5 space-y-3"
            >
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--text)">
                Your Question
              </label>
              <ValidatedInput
                multiline
                rows={3}
                value={newQuestion}
                onChange={e => { setNewQuestion(e.target.value); setErr(""); }}
                placeholder="What would you like to know about this saree?"
                inputClassName="resize-none border-(--border) bg-white"
              />
              {err && <p className="text-xs text-rose-500 mt-1">{err}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || !newQuestion.trim()}
                  className="flex items-center gap-1.5 rounded-full bg-(--gold) px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-(--text) disabled:opacity-60 cursor-not-allowed"
                >
                  {submitting
                    ? <><Loader2 size={12} className="animate-spin" /> Posting…</>
                    : <><Send size={12} /> Post Question</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-(--border) px-5 py-2.5 text-xs font-semibold text-(--muted) transition-colors hover:border-(--gold) hover:text-(--gold) cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Question list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-(--gold-soft)">
            <MessageCircle size={24} className="text-(--gold)" />
          </div>
          <p className="text-sm font-semibold text-(--text)">No questions yet</p>
          <p className="mt-1 text-xs text-(--muted)">
            Have a question about this product? Ask it below.
          </p>
          {!isLoggedIn() && (
            <a
              href="/login"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-(--gold) px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-(--text) cursor-pointer"
            >
              Login to Ask
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <QuestionItem key={q._id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
