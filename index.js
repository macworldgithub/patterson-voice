// // // // require("dotenv").config();

// // // // const express = require("express");
// // // // const http = require("http");
// // // // const { Server } = require("socket.io");
// // // // const WebSocket = require("ws");
// // // // const path = require("path");
// // // // const fs = require("fs");
// // // // const { v4: uuidv4 } = require("uuid");
// // // // const mongoose = require("mongoose");

// // // // // ─── Config ───────────────────────────────────────────────────────────────────
// // // // const PORT = process.env.BYD_VOICE_PORT || 4030;
// // // // const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// // // // const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// // // // const ELEVENLABS_VOICE_ID =
// // // //   process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
// // // // const MONGODB_URI = process.env.MONGODB_URI;
// // // // const PREWARM_TTL_MS = 60_000;

// // // // const OPENAI_REALTIME_MODEL =
// // // //   process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
// // // // const OPENAI_INPUT_SAMPLE_RATE = Number(
// // // //   process.env.OPENAI_INPUT_SAMPLE_RATE || 24000,
// // // // );
// // // // const OPENAI_VAD_THRESHOLD = Number(process.env.OPENAI_VAD_THRESHOLD || 0.8);
// // // // const OPENAI_VAD_PREFIX_PADDING_MS = Number(
// // // //   process.env.OPENAI_VAD_PREFIX_PADDING_MS || 300,
// // // // );
// // // // const OPENAI_VAD_SILENCE_DURATION_MS = Number(
// // // //   process.env.OPENAI_VAD_SILENCE_DURATION_MS || 2000,
// // // // );

// // // // // ─── MongoDB Connection ───────────────────────────────────────────────────────
// // // // if (!MONGODB_URI) {
// // // //   console.warn("⚠️  MONGODB_URI not set — call logs will NOT be saved.");
// // // // } else {
// // // //   mongoose
// // // //     .connect(MONGODB_URI)
// // // //     .then(() => console.log("✅  MongoDB connected"))
// // // //     .catch((err) => console.error("❌  MongoDB error:", err.message));
// // // // }

// // // // // ─── Call Log Schema ──────────────────────────────────────────────────────────
// // // // const callLogSchema = new mongoose.Schema(
// // // //   {
// // // //     id: { type: String, required: true, unique: true },
// // // //     sessionId: { type: String, required: true },
// // // //     caller_name: { type: String, default: null },
// // // //     caller_phone: { type: String, default: null },
// // // //     caller_email: { type: String, default: null },
// // // //     vehicle_interest: { type: String, default: null },
// // // //     intent_category: {
// // // //       type: String,
// // // //       enum: [
// // // //         "vehicle_inquiry",
// // // //         "test_drive_booking",
// // // //         "pricing_inquiry",
// // // //         "trade_in_inquiry",
// // // //         "finance_inquiry",
// // // //         "service_booking",
// // // //         "general_enquiry",
// // // //         "staff_transfer",
// // // //         "comparison_request",
// // // //         "availability_check",
// // // //         "no_transcript_admin",
// // // //       ],
// // // //       required: true,
// // // //     },
// // // //     preferred_time: { type: String, default: null },
// // // //     staff_requested: { type: String, default: null },
// // // //     outcome: {
// // // //       type: String,
// // // //       enum: [
// // // //         "test_drive_booked",
// // // //         "callback_scheduled",
// // // //         "transferred",
// // // //         "info_provided",
// // // //         "brochure_sent",
// // // //         "message_taken",
// // // //         "escalated",
// // // //         "quote_provided",
// // // //       ],
// // // //       required: true,
// // // //     },
// // // //     ai_summary: { type: String, default: null },
// // // //     sentiment: {
// // // //       type: String,
// // // //       enum: ["positive", "neutral", "negative"],
// // // //       default: "neutral",
// // // //     },
// // // //     confidence_score: { type: Number, default: null },
// // // //     escalated: { type: Boolean, default: false },
// // // //   },
// // // //   { timestamps: true },
// // // // );

// // // // const CallLog = mongoose.model("BYDCallLog", callLogSchema);

// // // // // ─── Recordings directory ─────────────────────────────────────────────────────
// // // // const RECORDINGS_DIR = path.join(__dirname, "recordings");
// // // // if (!fs.existsSync(RECORDINGS_DIR))
// // // //   fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

// // // // // ─── Express + Socket.IO ──────────────────────────────────────────────────────
// // // // const app = express();
// // // // const server = http.createServer(app);
// // // // const io = new Server(server, { cors: { origin: "*" } });

// // // // app.use(express.json());
// // // // app.use(express.static(path.join(__dirname, "public")));
// // // // app.use("/recordings", express.static(RECORDINGS_DIR));

// // // // // ─── Session State ────────────────────────────────────────────────────────────
// // // // const sessions = new Map();
// // // // const prewarmStates = new Map();

// // // // // ─── BYD Knowledge Base ───────────────────────────────────────────────────────
// // // // const BYD_KNOWLEDGE_SUMMARY = `
// // // // BYD VEHICLE LINEUP AT BYD FAIRFIELD:

// // // // ELECTRIC (BEV):
// // // // - ATTO 1: From $23,990 | Compact SUV | 220–310km range | Blade Battery | Great first EV
// // // // - ATTO 2: From $31,990 | Compact SUV | 345km range | 130kW | V2L capability
// // // // - ATTO 3: From $39,990 | Compact SUV | 420km range | 150kW | Most popular compact EV
// // // // - SEAL: From $52,990 | Sports sedan | 570km range (RWD) | Up to 390kW AWD | 3.8s 0-100
// // // // - SEALION 7: Mid-size SUV | 456km range | 230kW or 390kW AWD | Premium tech
// // // // - DOLPHIN: Compact hatchback | 427km range | City favourite | V2L | From ~$29,990

// // // // PLUG-IN HYBRID (PHEV):
// // // // - SEALION 5: PHEV SUV | DM-i tech | Long combined range | Affordable entry PHEV
// // // // - SEALION 6: From ~$44,990 | Mid-size PHEV SUV | DM-i | FWD | Ultra-low fuel use
// // // // - SEALION 8: 7-seat Super Hybrid SUV | DM-i/DM-p | Up to 359kW AWD | DiSus-C suspension
// // // // - SHARK 6: From $57,900 | PHEV dual-cab ute | 321–350kW | 800km combined range | 3,500kg towing

// // // // KEY TECH:
// // // // - Blade Battery: BYD's safe LFP battery — passes nail penetration test, cobalt-free
// // // // - V2L: Power external devices from the car battery
// // // // - DM-i: Efficient hybrid system, electric-first driving
// // // // - DM-p: Performance hybrid with AWD
// // // // - DiSus-C: Adaptive damping suspension
// // // // - OTA: Over-the-air updates
// // // // - WARRANTY: 6 years vehicle / 8 years or 160,000km battery

// // // // DEALERSHIP:
// // // // - BYD Fairfield | 415 Heidelberg Road, Fairfield VIC 3078
// // // // - Phone: 03 4110 8888 | bydfairfield.com.au
// // // // - Test drives available 7 days
// // // // `.trim();

// // // // // ─── System Prompt ────────────────────────────────────────────────────────────
// // // // function getSystemPrompt(carContext) {
// // // //   // Build car-specific context block if provided
// // // //   const carContextBlock = carContext
// // // //     ? `
// // // // =============================================================
// // // // ACTIVE CAR CONTEXT — THIS IS THE PRIMARY VEHICLE OF INTEREST
// // // // =============================================================
// // // // The caller has opened this voice session from the ${carContext} page.
// // // // They are SPECIFICALLY interested in the ${carContext}.
// // // // - Lead ALL responses with ${carContext}-specific information first.
// // // // - Proactively mention ${carContext} specs, pricing, and features when relevant.
// // // // - Your opening greeting MUST reference the ${carContext} by name.
// // // // - If asked about other models, answer briefly then steer back to the ${carContext}.
// // // // =============================================================
// // // // `
// // // //     : "";

// // // //   return `
// // // // =============================================================
// // // // ABSOLUTE RULE — ENGLISH ONLY. THIS OVERRIDES EVERYTHING.
// // // // =============================================================
// // // // You MUST respond in English only. If the caller speaks another language,
// // // // say: "Sorry, I can only assist in English at the moment."
// // // // =============================================================

// // // // ### IDENTITY ###
// // // // You are the AI voice assistant for BYD Fairfield — an authorised BYD dealership at 415 Heidelberg Road, Fairfield VIC 3078.
// // // // You handle inbound enquiries: vehicle information, test drive bookings, pricing, comparisons, finance questions, and general dealership enquiries.
// // // // You sound like a friendly, knowledgeable Australian car sales consultant — warm, helpful, and enthusiastic about BYD.
// // // // ${carContextBlock}
// // // // ### AI DISCLOSURE ###
// // // // - Do NOT volunteer that you are AI.
// // // // - ONLY if explicitly asked "are you a robot / AI / real person?" — be honest:
// // // //   "Good question — I'm actually an AI assistant helping the BYD Fairfield team. I can book test drives, answer questions about any BYD model, and help you find the right car. How can I help?"
// // // // - Pivot straight back to helping them.

// // // // ### PERSONALITY ###
// // // // - Friendly, warm Australian manner
// // // // - Genuinely enthusiastic about BYD's technology (Blade Battery, V2L, range etc.)
// // // // - Never pushy — consultative and helpful
// // // // - Natural fillers: "absolutely", "great question", "no worries", "sure thing", "for sure"
// // // // - Match caller energy: relaxed with relaxed callers, efficient with busy ones

// // // // ### HOW YOU TALK ###
// // // // - SHORT responses — 1 to 2 sentences max
// // // // - Contractions: "what's", "we've", "I'll", "you're", "that's"
// // // // - ACKNOWLEDGE first, then respond
// // // // - ONE question at a time — never stack questions
// // // // - Silence/can't hear: "Still there?" or "Sorry, didn't catch that — could you say that again?"

// // // // ### BYD VEHICLE KNOWLEDGE ###
// // // // ${BYD_KNOWLEDGE_SUMMARY}

// // // // QUICK RECOMMENDATIONS:
// // // // - City / first EV → Atto 1, Atto 2, Dolphin
// // // // - Family compact EV → Atto 3
// // // // - Larger electric SUV → Sealion 7
// // // // - Performance EV → Seal Performance
// // // // - No range anxiety / long trips → Sealion 5, 6, 8 (PHEV) or Shark 6
// // // // - 7-seat family hybrid → Sealion 8
// // // // - Work ute / towing → Shark 6 Performance

// // // // =============================================================
// // // // CALL FLOW
// // // // =============================================================

// // // // STEP 01 — GREETING & INTENT
// // // // ${
// // // //   carContext
// // // //     ? `The caller is already on the ${carContext} page — greet them and confirm their interest in the ${carContext} immediately.

// // // // Start: "Thanks for calling BYD Fairfield! I can see you're checking out the ${carContext} — great choice. How can I help you with it today?"

// // // // Then: "And who am I speaking with?"`
// // // //     : `Greet first. Ask for name early. One question at a time.

// // // // Start: "Thanks for calling BYD Fairfield — you're through to the front desk. How can I help you today?"

// // // // Then: "Great — and who am I speaking with?"`
// // // // }

// // // // Use their name naturally once you have it.

// // // // STEP 02 — VALUE PROP (for serious buyers only)
// // // // Trigger for: test drive requests, purchase intent, serious comparisons.
// // // // Skip for: quick info requests, direction questions.

// // // // Script (adapt naturally):
// // // // "We've got the full BYD range in stock at Fairfield — from the Dolphin city car right through to the Shark 6 ute. Every car comes with a 6-year warranty and BYD's industry-leading Blade Battery. We can arrange a test drive any day of the week — what's caught your eye?"

// // // // STEP 03 — PROACTIVE CLOSE
// // // // Never end passively. Always offer a next step.

// // // // For TEST DRIVE:
// // // // "I can lock that in for you — we've got slots tomorrow at 11am and Saturday at 10am. Which works better?"

// // // // For PRICING:
// // // // "The [model] starts from [price] drive-away. Would you like me to get one of our consultants to put together a personalised quote?"

// // // // For COMPARISON:
// // // // "[Model A] is the choice if you want [benefit A], while [Model B] suits [benefit B] better. Would you like to compare them in person with a test drive of both?"

// // // // STEP 04 — COLLECT DETAILS (when booking)
// // // // One detail at a time, conversationally:
// // // // - Name (may already have)
// // // // - Which vehicle they want to test / enquire about
// // // // - Preferred date/time
// // // // - Contact: phone or email

// // // // =============================================================
// // // // ESCALATION
// // // // =============================================================
// // // // ALWAYS escalate (log escalated: true) for:
// // // // - Complaints or disputes
// // // // - Finance / legal questions beyond general info
// // // // - Abusive callers
// // // // - Complex trade-in negotiations

// // // // Script: "I want to make sure you get the best help with this — let me connect you with one of our consultants right now. Just one moment."

// // // // =============================================================
// // // // STEP 05 — SAVE CALL LOG (MANDATORY after every completed call)
// // // // =============================================================
// // // // After every call where intent was established, call save_call_log.

// // // // Required: caller_name, intent_category, outcome
// // // // Optional but important: caller_phone, caller_email, vehicle_interest, preferred_time, ai_summary, sentiment, confidence_score, escalated

// // // // =============================================================
// // // // HARD RULES
// // // // =============================================================
// // // // - ENGLISH ONLY
// // // // - ONE question at a time
// // // // - 1–2 sentences max per response
// // // // - NEVER assume caller's name
// // // // - ALWAYS call save_call_log after every completed call
// // // // - Never give legal or finance advice beyond general info
// // // // - Never make up pricing not in your knowledge base
// // // // `.trim();
// // // // }

// // // // // ─── Tool Definition ──────────────────────────────────────────────────────────
// // // // function getSaveCallLogTool() {
// // // //   return {
// // // //     type: "function",
// // // //     name: "save_call_log",
// // // //     description:
// // // //       "Saves a structured call log after every completed BYD Fairfield call. MUST be called once intent is established and the call reaches a natural conclusion.",
// // // //     parameters: {
// // // //       type: "object",
// // // //       properties: {
// // // //         caller_name: { type: "string", description: "Full name of the caller" },
// // // //         caller_phone: { type: "string", description: "Caller's phone number" },
// // // //         caller_email: { type: "string", description: "Caller's email" },
// // // //         vehicle_interest: {
// // // //           type: "string",
// // // //           description:
// // // //             "Vehicle model they enquired about e.g. 'BYD Seal Performance', 'Shark 6'",
// // // //         },
// // // //         intent_category: {
// // // //           type: "string",
// // // //           enum: [
// // // //             "vehicle_inquiry",
// // // //             "test_drive_booking",
// // // //             "pricing_inquiry",
// // // //             "trade_in_inquiry",
// // // //             "finance_inquiry",
// // // //             "service_booking",
// // // //             "general_enquiry",
// // // //             "staff_transfer",
// // // //             "comparison_request",
// // // //             "availability_check",
// // // //             "no_transcript_admin",
// // // //           ],
// // // //         },
// // // //         preferred_time: {
// // // //           type: "string",
// // // //           description: "Booked or preferred time slot",
// // // //         },
// // // //         staff_requested: {
// // // //           type: "string",
// // // //           description: "Staff member requested by name",
// // // //         },
// // // //         outcome: {
// // // //           type: "string",
// // // //           enum: [
// // // //             "test_drive_booked",
// // // //             "callback_scheduled",
// // // //             "transferred",
// // // //             "info_provided",
// // // //             "brochure_sent",
// // // //             "message_taken",
// // // //             "escalated",
// // // //             "quote_provided",
// // // //           ],
// // // //         },
// // // //         ai_summary: {
// // // //           type: "string",
// // // //           description: "1–2 sentence summary of the call",
// // // //         },
// // // //         sentiment: {
// // // //           type: "string",
// // // //           enum: ["positive", "neutral", "negative"],
// // // //         },
// // // //         confidence_score: { type: "number", description: "0.0 to 1.0" },
// // // //         escalated: { type: "boolean" },
// // // //       },
// // // //       required: ["caller_name", "intent_category", "outcome"],
// // // //     },
// // // //   };
// // // // }

// // // // // ─── Recording (WAV builder) ──────────────────────────────────────────────────
// // // // class ConversationRecorder {
// // // //   constructor(sessionId) {
// // // //     this.sessionId = sessionId;
// // // //     this.userChunks = [];
// // // //     this.agentChunks = [];
// // // //     this.startTime = Date.now();
// // // //     this.events = [];
// // // //   }

// // // //   addUserAudio(base64Pcm16) {
// // // //     const buf = Buffer.from(base64Pcm16, "base64");
// // // //     this.userChunks.push(buf);
// // // //     this.events.push({
// // // //       type: "user",
// // // //       time: Date.now() - this.startTime,
// // // //       bytes: buf.length,
// // // //     });
// // // //   }

// // // //   addAgentAudio(base64Pcm16) {
// // // //     const buf = Buffer.from(base64Pcm16, "base64");
// // // //     this.agentChunks.push(buf);
// // // //     this.events.push({
// // // //       type: "agent",
// // // //       time: Date.now() - this.startTime,
// // // //       bytes: buf.length,
// // // //     });
// // // //   }

// // // //   _resample(pcmBuffer, srcRate, dstRate) {
// // // //     if (srcRate === dstRate) return pcmBuffer;
// // // //     const srcSamples = pcmBuffer.length / 2;
// // // //     const ratio = srcRate / dstRate;
// // // //     const dstSamples = Math.floor(srcSamples / ratio);
// // // //     const out = Buffer.alloc(dstSamples * 2);
// // // //     for (let i = 0; i < dstSamples; i++) {
// // // //       const srcIdx = i * ratio;
// // // //       const lo = Math.floor(srcIdx);
// // // //       const hi = Math.min(lo + 1, srcSamples - 1);
// // // //       const frac = srcIdx - lo;
// // // //       const sLo = pcmBuffer.readInt16LE(lo * 2);
// // // //       const sHi = pcmBuffer.readInt16LE(hi * 2);
// // // //       const val = Math.round(sLo + (sHi - sLo) * frac);
// // // //       out.writeInt16LE(Math.max(-32768, Math.min(32767, val)), i * 2);
// // // //     }
// // // //     return out;
// // // //   }

// // // //   saveToFile() {
// // // //     const OUTPUT_RATE = 24000;
// // // //     const userPcm = Buffer.concat(this.userChunks);
// // // //     const agentPcm = this._resample(
// // // //       Buffer.concat(this.agentChunks),
// // // //       16000,
// // // //       OUTPUT_RATE,
// // // //     );
// // // //     const totalSamples = Math.max(userPcm.length / 2, agentPcm.length / 2);
// // // //     const mixed = Buffer.alloc(totalSamples * 2);

// // // //     for (let i = 0; i < totalSamples; i++) {
// // // //       let v = 0;
// // // //       if (i < userPcm.length / 2) v += userPcm.readInt16LE(i * 2);
// // // //       if (i < agentPcm.length / 2) v += agentPcm.readInt16LE(i * 2);
// // // //       mixed.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
// // // //     }

// // // //     const hdr = Buffer.alloc(44);
// // // //     const dataSize = mixed.length;
// // // //     hdr.write("RIFF", 0);
// // // //     hdr.writeUInt32LE(36 + dataSize, 4);
// // // //     hdr.write("WAVE", 8);
// // // //     hdr.write("fmt ", 12);
// // // //     hdr.writeUInt32LE(16, 16);
// // // //     hdr.writeUInt16LE(1, 20);
// // // //     hdr.writeUInt16LE(1, 22);
// // // //     hdr.writeUInt32LE(OUTPUT_RATE, 24);
// // // //     hdr.writeUInt32LE(OUTPUT_RATE * 2, 28);
// // // //     hdr.writeUInt16LE(2, 32);
// // // //     hdr.writeUInt16LE(16, 34);
// // // //     hdr.write("data", 36);
// // // //     hdr.writeUInt32LE(dataSize, 40);

// // // //     const wav = Buffer.concat([hdr, mixed]);
// // // //     const filename = `byd_call_${this.sessionId}_${Date.now()}.wav`;
// // // //     const filepath = path.join(RECORDINGS_DIR, filename);
// // // //     fs.writeFileSync(filepath, wav);
// // // //     console.log(
// // // //       `[Recording] Saved: ${filename} (${(wav.length / 1024 / 1024).toFixed(2)} MB)`,
// // // //     );
// // // //     return {
// // // //       filename,
// // // //       filepath,
// // // //       sizeMB: (wav.length / 1024 / 1024).toFixed(2),
// // // //     };
// // // //   }
// // // // }

// // // // // ─── Helpers ──────────────────────────────────────────────────────────────────
// // // // function sendWsJson(ws, payload) {
// // // //   if (!ws || ws.readyState !== WebSocket.OPEN) return false;
// // // //   ws.send(JSON.stringify(payload));
// // // //   return true;
// // // // }

// // // // function safeJsonParse(text) {
// // // //   try {
// // // //     return JSON.parse(text);
// // // //   } catch {
// // // //     return null;
// // // //   }
// // // // }

// // // // function toFunctionCallPayload(value) {
// // // //   if (!value || typeof value !== "object") return null;

// // // //   if (
// // // //     value.type === "function_call" &&
// // // //     typeof value.name === "string" &&
// // // //     typeof value.arguments === "string" &&
// // // //     typeof value.call_id === "string"
// // // //   ) {
// // // //     return {
// // // //       name: value.name,
// // // //       arguments: value.arguments,
// // // //       call_id: value.call_id,
// // // //     };
// // // //   }

// // // //   if (
// // // //     typeof value.name === "string" &&
// // // //     typeof value.arguments === "string" &&
// // // //     typeof value.call_id === "string"
// // // //   ) {
// // // //     return {
// // // //       name: value.name,
// // // //       arguments: value.arguments,
// // // //       call_id: value.call_id,
// // // //     };
// // // //   }

// // // //   return null;
// // // // }

// // // // function extractFunctionCallsFromResponse(response) {
// // // //   const calls = [];
// // // //   const output = response?.output;
// // // //   if (Array.isArray(output)) {
// // // //     for (const item of output) {
// // // //       const fc = toFunctionCallPayload(item);
// // // //       if (fc) calls.push(fc);
// // // //     }
// // // //   }
// // // //   return calls;
// // // // }

// // // // // ─── OpenAI Realtime Session ──────────────────────────────────────────────────
// // // // function createRealtimeSession(sessionId, onEvent, carContext) {
// // // //   const url = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
// // // //   const startMs = Date.now();

// // // //   return new Promise((resolve, reject) => {
// // // //     const ws = new WebSocket(url, {
// // // //       headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
// // // //     });

// // // //     ws.on("open", () => {
// // // //       console.log(
// // // //         `[${sessionId}] OpenAI Realtime connected (${Date.now() - startMs}ms)${carContext ? ` | Car context: ${carContext}` : ""}`,
// // // //       );

// // // //       sendWsJson(ws, {
// // // //         type: "session.update",
// // // //         session: {
// // // //           type: "realtime",
// // // //           model: OPENAI_REALTIME_MODEL,
// // // //           output_modalities: ["text"],
// // // //           audio: {
// // // //             input: {
// // // //               format: {
// // // //                 type: "audio/pcm",
// // // //                 rate: OPENAI_INPUT_SAMPLE_RATE,
// // // //               },
// // // //               turn_detection: {
// // // //                 type: "server_vad",
// // // //                 threshold: OPENAI_VAD_THRESHOLD,
// // // //                 prefix_padding_ms: OPENAI_VAD_PREFIX_PADDING_MS,
// // // //                 silence_duration_ms: OPENAI_VAD_SILENCE_DURATION_MS,
// // // //               },
// // // //             },
// // // //           },
// // // //           // Pass carContext into the system prompt
// // // //           instructions: getSystemPrompt(carContext || null),
// // // //           tools: [getSaveCallLogTool()],
// // // //           tool_choice: "auto",
// // // //         },
// // // //       });

// // // //       const session = {
// // // //         ws,
// // // //         carContext: carContext || null,
// // // //         elevenLabsWs: null,
// // // //         elevenLabsReady: false,
// // // //         textBuffer: [],
// // // //         isResponseActive: false,
// // // //         onEvent,
// // // //         startMs,
// // // //         openAiConnectedMs: Date.now(),
// // // //         elevenLabsConnectedMs: null,
// // // //         greetingTriggeredMs: null,
// // // //         firstResponseCreatedMs: null,
// // // //         firstAudioDeltaLogged: false,
// // // //         processedCallIds: new Set(),
// // // //         recorder: new ConversationRecorder(sessionId),
// // // //         callLogs: [],
// // // //         elevenLabsOpening: false,
// // // //       };

// // // //       sessions.set(sessionId, session);
// // // //       openElevenLabsStream(sessionId);
// // // //       resolve();
// // // //     });

// // // //     ws.on("message", async (data) => {
// // // //       try {
// // // //         const event = JSON.parse(data.toString());
// // // //         await handleRealtimeEvent(sessionId, event);
// // // //       } catch (err) {
// // // //         console.error(`[${sessionId}] Parse error:`, err.message);
// // // //       }
// // // //     });

// // // //     ws.on("error", (err) => {
// // // //       console.error(`[${sessionId}] OpenAI WS error:`, err.message);
// // // //       onEvent({ type: "error", error: { message: err.message } });
// // // //       reject(err);
// // // //     });

// // // //     ws.on("close", (code) => {
// // // //       console.log(`[${sessionId}] OpenAI WS closed: ${code}`);
// // // //       closeElevenLabsWs(sessionId);
// // // //       sessions.delete(sessionId);
// // // //       onEvent({ type: "session-closed" });
// // // //     });
// // // //   });
// // // // }

// // // // // ─── Audio helpers ────────────────────────────────────────────────────────────
// // // // function sendAudio(sessionId, base64Audio) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;
// // // //   session.recorder.addUserAudio(base64Audio);
// // // //   sendWsJson(session.ws, {
// // // //     type: "input_audio_buffer.append",
// // // //     audio: base64Audio,
// // // //   });
// // // // }

// // // // // ─── Trigger greeting — car-context-aware ─────────────────────────────────────
// // // // function triggerGreeting(sessionId) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;
// // // //   session.greetingTriggeredMs = Date.now();
// // // //   console.log(
// // // //     `[${sessionId}] Greeting triggered (${session.greetingTriggeredMs - session.startMs}ms)`,
// // // //   );

// // // //   if (session.carContext) {
// // // //     // Inject a hidden "user" conversation item so the model knows exactly which
// // // //     // car page the caller opened — this primes the greeting without the caller
// // // //     // having to say anything.
// // // //     const primeMessage =
// // // //       `The caller has just opened the voice assistant from the ${session.carContext} page. ` +
// // // //       `They are interested in the ${session.carContext}. ` +
// // // //       `Greet them warmly and reference the ${session.carContext} by name in your opening line.`;

// // // //     sendWsJson(session.ws, {
// // // //       type: "conversation.item.create",
// // // //       item: {
// // // //         type: "message",
// // // //         role: "user",
// // // //         content: [{ type: "input_text", text: primeMessage }],
// // // //       },
// // // //     });
// // // //   }

// // // //   sendWsJson(session.ws, { type: "response.create" });
// // // // }

// // // // // ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

// // // // function _openNewElevenLabsStream(sessionId) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;

// // // //   if (session.elevenLabsOpening) {
// // // //     console.log(`[${sessionId}] ElevenLabs open already in-flight, skipping`);
// // // //     return;
// // // //   }
// // // //   session.elevenLabsOpening = true;

// // // //   const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream-input?model_id=eleven_multilingual_v2&output_format=pcm_16000`;
// // // //   const elWs = new WebSocket(wsUrl);

// // // //   elWs.on("open", () => {
// // // //     if (!sessions.has(sessionId) || session.elevenLabsWs !== elWs) {
// // // //       elWs.close();
// // // //       return;
// // // //     }

// // // //     console.log(`[${sessionId}] ElevenLabs connected`);
// // // //     session.elevenLabsConnectedMs = Date.now();
// // // //     session.elevenLabsOpening = false;

// // // //     elWs.send(
// // // //       JSON.stringify({
// // // //         text: " ",
// // // //         voice_settings: {
// // // //           stability: 0.5,
// // // //           similarity_boost: 0.8,
// // // //           style: 0.3,
// // // //           use_speaker_boost: true,
// // // //         },
// // // //         xi_api_key: ELEVENLABS_API_KEY,
// // // //       }),
// // // //     );

// // // //     session.elevenLabsReady = true;
// // // //     for (const text of session.textBuffer) {
// // // //       if (elWs.readyState === WebSocket.OPEN) {
// // // //         elWs.send(JSON.stringify({ text, try_trigger_generation: true }));
// // // //       }
// // // //     }
// // // //     session.textBuffer = [];
// // // //   });

// // // //   elWs.on("message", (data) => {
// // // //     try {
// // // //       const msg = JSON.parse(data.toString());
// // // //       if (msg.audio) {
// // // //         session.recorder.addAgentAudio(msg.audio);
// // // //         session.onEvent({ type: "audio-delta", delta: msg.audio });
// // // //       }
// // // //     } catch {}
// // // //   });

// // // //   elWs.on("error", (err) => {
// // // //     console.warn(`[${sessionId}] ElevenLabs error: ${err.message}`);
// // // //     session.elevenLabsOpening = false;
// // // //   });

// // // //   elWs.on("close", () => {
// // // //     if (session.elevenLabsWs === elWs) {
// // // //       session.elevenLabsReady = false;
// // // //       session.elevenLabsOpening = false;
// // // //     }
// // // //   });

// // // //   session.elevenLabsWs = elWs;
// // // // }

// // // // function openElevenLabsStream(sessionId, force = false) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;

// // // //   const oldWs = session.elevenLabsWs;

// // // //   if (!force) {
// // // //     if (
// // // //       oldWs &&
// // // //       (oldWs.readyState === WebSocket.OPEN ||
// // // //         oldWs.readyState === WebSocket.CONNECTING)
// // // //     ) {
// // // //       return;
// // // //     }
// // // //     _openNewElevenLabsStream(sessionId);
// // // //     return;
// // // //   }

// // // //   session.textBuffer = [];
// // // //   session.elevenLabsReady = false;

// // // //   if (
// // // //     !oldWs ||
// // // //     oldWs.readyState === WebSocket.CLOSED ||
// // // //     oldWs.readyState === WebSocket.CLOSING
// // // //   ) {
// // // //     session.elevenLabsWs = null;
// // // //     session.elevenLabsOpening = false;
// // // //     _openNewElevenLabsStream(sessionId);
// // // //     return;
// // // //   }

// // // //   if (oldWs.readyState === WebSocket.CONNECTING) {
// // // //     session.elevenLabsWs = null;
// // // //     session.elevenLabsOpening = false;
// // // //     try {
// // // //       oldWs.terminate();
// // // //     } catch (_) {}
// // // //     _openNewElevenLabsStream(sessionId);
// // // //     return;
// // // //   }

// // // //   session.elevenLabsWs = null;
// // // //   session.elevenLabsOpening = false;

// // // //   try {
// // // //     oldWs.send(JSON.stringify({ text: "" }));
// // // //   } catch (_) {}

// // // //   oldWs.once("close", () => {
// // // //     if (!sessions.has(sessionId)) return;
// // // //     const s = sessions.get(sessionId);
// // // //     if (s && !s.elevenLabsWs && !s.elevenLabsOpening) {
// // // //       _openNewElevenLabsStream(sessionId);
// // // //     }
// // // //   });

// // // //   setTimeout(() => {
// // // //     if (!sessions.has(sessionId)) return;
// // // //     const s = sessions.get(sessionId);
// // // //     if (s && !s.elevenLabsWs && !s.elevenLabsOpening) {
// // // //       console.warn(`[${sessionId}] ElevenLabs close timeout — forcing open`);
// // // //       _openNewElevenLabsStream(sessionId);
// // // //     }
// // // //   }, 800);

// // // //   try {
// // // //     oldWs.close();
// // // //   } catch (_) {}
// // // // }

// // // // function sendTextToElevenLabs(sessionId, text) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;
// // // //   if (
// // // //     session.elevenLabsWs?.readyState === WebSocket.OPEN &&
// // // //     session.elevenLabsReady
// // // //   ) {
// // // //     session.elevenLabsWs.send(
// // // //       JSON.stringify({ text, try_trigger_generation: true }),
// // // //     );
// // // //   } else {
// // // //     session.textBuffer.push(text);
// // // //   }
// // // // }

// // // // function flushElevenLabsStream(sessionId) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (session?.elevenLabsWs?.readyState === WebSocket.OPEN) {
// // // //     session.elevenLabsWs.send(JSON.stringify({ text: "" }));
// // // //   }
// // // // }

// // // // function closeElevenLabsWs(sessionId) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (session?.elevenLabsWs) {
// // // //     try {
// // // //       if (session.elevenLabsWs.readyState === WebSocket.CONNECTING)
// // // //         session.elevenLabsWs.terminate();
// // // //       else if (session.elevenLabsWs.readyState === WebSocket.OPEN)
// // // //         session.elevenLabsWs.close();
// // // //     } catch {}
// // // //     session.elevenLabsWs = null;
// // // //     session.elevenLabsReady = false;
// // // //     session.elevenLabsOpening = false;
// // // //     session.textBuffer = [];
// // // //   }
// // // // }

// // // // // ─── Function call handler ────────────────────────────────────────────────────
// // // // async function handleFunctionCall(sessionId, eventOrItem) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;

// // // //   const call = toFunctionCallPayload(eventOrItem);
// // // //   if (!call || call.name !== "save_call_log") return;

// // // //   const callId = typeof call.call_id === "string" ? call.call_id : null;
// // // //   if (callId && session.processedCallIds.has(callId)) return;
// // // //   if (callId) session.processedCallIds.add(callId);

// // // //   try {
// // // //     const args = JSON.parse(call.arguments);
// // // //     console.log(
// // // //       `[${sessionId}] Saving call log | name: ${args.caller_name} | intent: ${args.intent_category} | outcome: ${args.outcome}`,
// // // //     );

// // // //     const logId = uuidv4();
// // // //     const callLog = new CallLog({
// // // //       id: logId,
// // // //       sessionId,
// // // //       caller_name: args.caller_name || null,
// // // //       caller_phone: args.caller_phone || null,
// // // //       caller_email: args.caller_email || null,
// // // //       // Auto-populate vehicle_interest from carContext if AI didn't extract one
// // // //       vehicle_interest: args.vehicle_interest || session.carContext || null,
// // // //       intent_category: args.intent_category,
// // // //       preferred_time: args.preferred_time || null,
// // // //       staff_requested: args.staff_requested || null,
// // // //       outcome: args.outcome,
// // // //       ai_summary: args.ai_summary || null,
// // // //       sentiment: args.sentiment || "neutral",
// // // //       confidence_score: args.confidence_score || null,
// // // //       escalated: args.escalated || false,
// // // //     });

// // // //     await callLog.save();
// // // //     session.callLogs.push({ id: logId, ...args });
// // // //     console.log(`[${sessionId}] Call log saved to MongoDB: ${logId}`);

// // // //     sendWsJson(session.ws, {
// // // //       type: "conversation.item.create",
// // // //       item: {
// // // //         type: "function_call_output",
// // // //         call_id: call.call_id,
// // // //         output: JSON.stringify({
// // // //           success: true,
// // // //           message: "Call log saved successfully.",
// // // //           log_id: logId,
// // // //           outcome: args.outcome,
// // // //         }),
// // // //       },
// // // //     });
// // // //     sendWsJson(session.ws, { type: "response.create" });
// // // //     session.onEvent({ type: "call-logged", data: args });
// // // //   } catch (err) {
// // // //     if (callId) session.processedCallIds.delete(callId);
// // // //     console.error(`[${sessionId}] Call log save failed:`, err.message);
// // // //   }
// // // // }

// // // // // ─── OpenAI Event handler ─────────────────────────────────────────────────────
// // // // async function handleRealtimeEvent(sessionId, event) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (!session) return;

// // // //   switch (event.type) {
// // // //     case "session.created":
// // // //     case "session.updated":
// // // //       break;

// // // //     case "response.created":
// // // //       session.isResponseActive = true;
// // // //       if (!session.firstResponseCreatedMs) {
// // // //         session.firstResponseCreatedMs = Date.now();
// // // //       }
// // // //       if (
// // // //         !session.elevenLabsWs ||
// // // //         (session.elevenLabsWs.readyState !== WebSocket.OPEN &&
// // // //           session.elevenLabsWs.readyState !== WebSocket.CONNECTING)
// // // //       ) {
// // // //         openElevenLabsStream(sessionId);
// // // //       }
// // // //       break;

// // // //     case "response.output_text.delta":
// // // //     case "response.text.delta":
// // // //       sendTextToElevenLabs(sessionId, event.delta);
// // // //       session.onEvent({ type: "transcript-delta", delta: event.delta });
// // // //       break;

// // // //     case "response.output_text.done":
// // // //     case "response.text.done":
// // // //       flushElevenLabsStream(sessionId);
// // // //       session.onEvent({ type: "transcript-done", transcript: event.text });
// // // //       break;

// // // //     case "response.done": {
// // // //       session.isResponseActive = false;
// // // //       const calls = extractFunctionCallsFromResponse(event.response);
// // // //       for (const fc of calls) await handleFunctionCall(sessionId, fc);
// // // //       break;
// // // //     }

// // // //     case "response.output_item.done":
// // // //       if (event.item) {
// // // //         const fc = toFunctionCallPayload(event.item);
// // // //         if (fc) await handleFunctionCall(sessionId, fc);
// // // //       }
// // // //       break;

// // // //     case "response.function_call_arguments.done":
// // // //       await handleFunctionCall(sessionId, event);
// // // //       break;

// // // //     case "input_audio_buffer.speech_started":
// // // //       console.log(`[${sessionId}] User interrupted — stopping AI voice`);

// // // //       if (session.isResponseActive) {
// // // //         sendWsJson(session.ws, { type: "response.cancel" });
// // // //         session.isResponseActive = false;
// // // //       }

// // // //       openElevenLabsStream(sessionId, true);
// // // //       session.onEvent({ type: "speech-started" });
// // // //       break;

// // // //     case "conversation.item.input_audio_transcription.completed":
// // // //       session.onEvent({
// // // //         type: "user-transcript",
// // // //         transcript: event.transcript,
// // // //       });
// // // //       break;

// // // //     case "error":
// // // //       console.error(
// // // //         `[${sessionId}] OpenAI error:`,
// // // //         JSON.stringify(event.error),
// // // //       );
// // // //       session.onEvent({ type: "error", error: event.error });
// // // //       break;

// // // //     default:
// // // //       break;
// // // //   }
// // // // }

// // // // // ─── Close session ────────────────────────────────────────────────────────────
// // // // function closeSession(sessionId) {
// // // //   const session = sessions.get(sessionId);
// // // //   if (session) {
// // // //     try {
// // // //       const result = session.recorder.saveToFile();
// // // //       session.onEvent({
// // // //         type: "recording-saved",
// // // //         data: {
// // // //           filename: result.filename,
// // // //           url: `/recordings/${result.filename}`,
// // // //         },
// // // //       });
// // // //     } catch (err) {
// // // //       console.error(`[${sessionId}] Recording save failed:`, err.message);
// // // //     }
// // // //     closeElevenLabsWs(sessionId);
// // // //     try {
// // // //       session.ws.close();
// // // //     } catch {}
// // // //     sessions.delete(sessionId);
// // // //     console.log(`[${sessionId}] Session closed`);
// // // //   }
// // // // }

// // // // // ─── Prewarm ──────────────────────────────────────────────────────────────────
// // // // // NOTE: Prewarm sessions use no carContext (generic). When start-session is
// // // // // called with a carContext, we cannot reuse the prewarm — a fresh session is
// // // // // created so the system prompt is tailored to the specific car.
// // // // function clearPrewarmState(sessionId) {
// // // //   const state = prewarmStates.get(sessionId);
// // // //   if (!state) return;
// // // //   clearTimeout(state.ttlTimer);
// // // //   prewarmStates.delete(sessionId);
// // // // }

// // // // function startPrewarm(sessionId, eventForwarder) {
// // // //   if (prewarmStates.has(sessionId)) return prewarmStates.get(sessionId).promise;

// // // //   const state = { promise: null, ready: false, failed: false, ttlTimer: null };

// // // //   // Prewarm with no carContext — generic prompt
// // // //   state.promise = createRealtimeSession(sessionId, eventForwarder, null)
// // // //     .then(() => {
// // // //       state.ready = true;
// // // //       console.log(`[${sessionId}] Prewarm ready`);
// // // //     })
// // // //     .catch((err) => {
// // // //       state.failed = true;
// // // //       console.warn(`[${sessionId}] Prewarm failed: ${err.message}`);
// // // //       throw err;
// // // //     });

// // // //   state.ttlTimer = setTimeout(() => {
// // // //     if (!prewarmStates.has(sessionId)) return;
// // // //     console.log(`[${sessionId}] Prewarm TTL expired — closing idle session`);
// // // //     clearPrewarmState(sessionId);
// // // //     closeSession(sessionId);
// // // //   }, PREWARM_TTL_MS);

// // // //   prewarmStates.set(sessionId, state);
// // // //   return state.promise;
// // // // }

// // // // // ─── Event Forwarder ──────────────────────────────────────────────────────────
// // // // function buildEventForwarder(socket) {
// // // //   return (event) => {
// // // //     switch (event.type) {
// // // //       case "audio-delta":
// // // //         socket.emit("audio-delta", { delta: event.delta });
// // // //         break;
// // // //       case "transcript-delta":
// // // //         socket.emit("transcript-delta", { delta: event.delta });
// // // //         break;
// // // //       case "transcript-done":
// // // //         socket.emit("transcript-done", { transcript: event.transcript });
// // // //         break;
// // // //       case "user-transcript":
// // // //         socket.emit("user-transcript", { transcript: event.transcript });
// // // //         break;
// // // //       case "speech-started":
// // // //         socket.emit("speech-started", {});
// // // //         break;
// // // //       case "call-logged":
// // // //         socket.emit("call-logged", event.data);
// // // //         break;
// // // //       case "recording-saved":
// // // //         socket.emit("recording-saved", event.data);
// // // //         break;
// // // //       case "error":
// // // //         socket.emit("realtime-error", { error: event.error });
// // // //         break;
// // // //       case "session-closed":
// // // //         socket.emit("session-closed", {});
// // // //         break;
// // // //     }
// // // //   };
// // // // }

// // // // // ─── Socket.IO ────────────────────────────────────────────────────────────────
// // // // io.on("connection", (socket) => {
// // // //   console.log(`Client connected: ${socket.id}`);
// // // //   const forwarder = buildEventForwarder(socket);

// // // //   // Prewarm immediately on connection (generic, no car context)
// // // //   startPrewarm(socket.id, forwarder).catch(() => {});

// // // //   socket.on("start-session", async (data) => {
// // // //     const sessionId = socket.id;
// // // //     // ── NEW: accept carContext from the client ────────────────────────────
// // // //     const carContext = data?.carContext || null;
// // // //     console.log(
// // // //       `[${sessionId}] Starting voice session${carContext ? ` | Car: ${carContext}` : ""}`,
// // // //     );

// // // //     try {
// // // //       if (carContext) {
// // // //         // Car context present → cannot reuse generic prewarm session.
// // // //         // Close any prewarm, then open a fresh car-specific session.
// // // //         clearPrewarmState(sessionId);
// // // //         closeSession(sessionId);

// // // //         await createRealtimeSession(sessionId, forwarder, carContext);
// // // //         socket.emit("session-started", { sessionId });
// // // //         triggerGreeting(sessionId);
// // // //         return;
// // // //       }

// // // //       // No car context — try to reuse prewarm as before
// // // //       let state = prewarmStates.get(sessionId);
// // // //       if (!state) {
// // // //         await startPrewarm(sessionId, forwarder);
// // // //         state = prewarmStates.get(sessionId);
// // // //       }
// // // //       if (state) {
// // // //         try {
// // // //           await state.promise;
// // // //           if (state.ready) {
// // // //             clearPrewarmState(sessionId);
// // // //             socket.emit("session-started", { sessionId });
// // // //             triggerGreeting(sessionId);
// // // //             return;
// // // //           }
// // // //         } catch {}
// // // //         clearPrewarmState(sessionId);
// // // //       }

// // // //       await createRealtimeSession(sessionId, forwarder, null);
// // // //       socket.emit("session-started", { sessionId });
// // // //       triggerGreeting(sessionId);
// // // //     } catch (err) {
// // // //       console.error(`[${sessionId}] Session start failed:`, err.message);
// // // //       socket.emit("realtime-error", {
// // // //         error: { message: "Failed to connect to AI service" },
// // // //       });
// // // //     }
// // // //   });

// // // //   socket.on("audio-chunk", (data) => {
// // // //     if (data?.audio) sendAudio(socket.id, data.audio);
// // // //   });

// // // //   socket.on("end-session", () => {
// // // //     console.log(`[${socket.id}] End session requested`);
// // // //     clearPrewarmState(socket.id);
// // // //     closeSession(socket.id);
// // // //     socket.emit("session-closed", {});
// // // //   });

// // // //   socket.on("disconnect", () => {
// // // //     console.log(`Client disconnected: ${socket.id}`);
// // // //     clearPrewarmState(socket.id);
// // // //     closeSession(socket.id);
// // // //   });
// // // // });

// // // // // ─── REST Endpoints ───────────────────────────────────────────────────────────
// // // // app.get("/api/call-logs", async (req, res) => {
// // // //   try {
// // // //     const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
// // // //     res.json(logs);
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: "Failed to fetch call logs" });
// // // //   }
// // // // });

// // // // app.get("/api/call-logs/intent/:intent", async (req, res) => {
// // // //   try {
// // // //     const logs = await CallLog.find({ intent_category: req.params.intent })
// // // //       .sort({ createdAt: -1 })
// // // //       .lean();
// // // //     res.json(logs);
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: "Failed to fetch call logs" });
// // // //   }
// // // // });

// // // // app.get("/api/recordings", (req, res) => {
// // // //   const files = fs
// // // //     .readdirSync(RECORDINGS_DIR)
// // // //     .filter((f) => f.endsWith(".wav"));
// // // //   res.json(
// // // //     files.map((f) => ({
// // // //       filename: f,
// // // //       url: `/recordings/${f}`,
// // // //       size:
// // // //         (fs.statSync(path.join(RECORDINGS_DIR, f)).size / 1024 / 1024).toFixed(
// // // //           2,
// // // //         ) + " MB",
// // // //     })),
// // // //   );
// // // // });

// // // // app.get("/api/health", (req, res) =>
// // // //   res.json({ status: "ok", sessions: sessions.size }),
// // // // );

// // // // // ─── Start ────────────────────────────────────────────────────────────────────
// // // // server.listen(PORT, () => {
// // // //   console.log(`
// // // // ╔══════════════════════════════════════════════════════════════╗
// // // // ║   BYD Fairfield — AI Voice Agent (OmniSuiteAI)               ║
// // // // ║   Running on http://localhost:${PORT}                         ║
// // // // ║                                                              ║
// // // // ║   Model:          ${OPENAI_REALTIME_MODEL}                   ║
// // // // ║   OpenAI API Key: ${OPENAI_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// // // // ║   ElevenLabs Key: ${ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// // // // ║   Voice ID:       ${ELEVENLABS_VOICE_ID}                     ║
// // // // ║   MongoDB:        ${MONGODB_URI ? "✓ Set" : "✗ Missing"}                             ║
// // // // ╚══════════════════════════════════════════════════════════════╝
// // // //   `);
// // // // });
// // // require("dotenv").config();

// // // const express = require("express");
// // // const http = require("http");
// // // const { Server } = require("socket.io");
// // // const WebSocket = require("ws");
// // // const path = require("path");
// // // const fs = require("fs");
// // // const { v4: uuidv4 } = require("uuid");
// // // const mongoose = require("mongoose");

// // // // ─── Config ───────────────────────────────────────────────────────────────────
// // // const PORT = process.env.BYD_VOICE_PORT || 4030;
// // // const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// // // const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// // // const ELEVENLABS_VOICE_ID =
// // //   process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
// // // const MONGODB_URI = process.env.MONGODB_URI;
// // // const PREWARM_TTL_MS = 60_000;
// // // const PREWARM_CONNECT_DELAY_MS = 400; // NEW: debounce prewarm to avoid burning real connections on rapid connect/disconnect (StrictMode, fast refresh, flaky network)

// // // const OPENAI_REALTIME_MODEL =
// // //   process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
// // // const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini"; // NEW: used for end-of-call summary
// // // const OPENAI_INPUT_SAMPLE_RATE = Number(
// // //   process.env.OPENAI_INPUT_SAMPLE_RATE || 24000,
// // // );
// // // const OPENAI_VAD_THRESHOLD = Number(process.env.OPENAI_VAD_THRESHOLD || 0.8);
// // // const OPENAI_VAD_PREFIX_PADDING_MS = Number(
// // //   process.env.OPENAI_VAD_PREFIX_PADDING_MS || 300,
// // // );
// // // const OPENAI_VAD_SILENCE_DURATION_MS = Number(
// // //   process.env.OPENAI_VAD_SILENCE_DURATION_MS || 2000,
// // // );

// // // // ─── MongoDB Connection ───────────────────────────────────────────────────────
// // // if (!MONGODB_URI) {
// // //   console.warn("⚠️  MONGODB_URI not set — call logs will NOT be saved.");
// // // } else {
// // //   mongoose
// // //     .connect(MONGODB_URI)
// // //     .then(() => console.log("✅  MongoDB connected"))
// // //     .catch((err) => console.error("❌  MongoDB error:", err.message));
// // // }

// // // // ─── Call Log Schema ──────────────────────────────────────────────────────────
// // // const callLogSchema = new mongoose.Schema(
// // //   {
// // //     id: { type: String, required: true, unique: true },
// // //     sessionId: { type: String, required: true },
// // //     caller_name: { type: String, default: null },
// // //     caller_phone: { type: String, default: null },
// // //     caller_email: { type: String, default: null },
// // //     vehicle_interest: { type: String, default: null },
// // //     intent_category: {
// // //       type: String,
// // //       enum: [
// // //         "vehicle_inquiry",
// // //         "test_drive_booking",
// // //         "pricing_inquiry",
// // //         "trade_in_inquiry",
// // //         "finance_inquiry",
// // //         "service_booking",
// // //         "general_enquiry",
// // //         "staff_transfer",
// // //         "comparison_request",
// // //         "availability_check",
// // //         "no_transcript_admin",
// // //       ],
// // //       required: true,
// // //     },
// // //     preferred_time: { type: String, default: null },
// // //     staff_requested: { type: String, default: null },
// // //     outcome: {
// // //       type: String,
// // //       enum: [
// // //         "test_drive_booked",
// // //         "callback_scheduled",
// // //         "transferred",
// // //         "info_provided",
// // //         "brochure_sent",
// // //         "message_taken",
// // //         "escalated",
// // //         "quote_provided",
// // //       ],
// // //       required: true,
// // //     },
// // //     ai_summary: { type: String, default: null },
// // //     sentiment: {
// // //       type: String,
// // //       enum: ["positive", "neutral", "negative"],
// // //       default: "neutral",
// // //     },
// // //     confidence_score: { type: Number, default: null },
// // //     escalated: { type: Boolean, default: false },
// // //     full_transcript: { type: Array, default: [] }, // NEW: store full transcript with the log
// // //   },
// // //   { timestamps: true },
// // // );

// // // const CallLog = mongoose.model("BYDCallLog", callLogSchema);

// // // // ─── Recordings directory ─────────────────────────────────────────────────────
// // // const RECORDINGS_DIR = path.join(__dirname, "recordings");
// // // if (!fs.existsSync(RECORDINGS_DIR))
// // //   fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

// // // // ─── Express + Socket.IO ──────────────────────────────────────────────────────
// // // const app = express();
// // // const server = http.createServer(app);
// // // const io = new Server(server, { cors: { origin: "*" } });

// // // app.use(express.json());
// // // app.use(express.static(path.join(__dirname, "public")));
// // // app.use("/recordings", express.static(RECORDINGS_DIR));

// // // // ─── Session State ────────────────────────────────────────────────────────────
// // // const sessions = new Map();
// // // const prewarmStates = new Map();
// // // const prewarmTimers = new Map(); // NEW: pending debounced prewarm timers per socket id

// // // // ─── BYD Knowledge Base ───────────────────────────────────────────────────────
// // // const BYD_KNOWLEDGE_SUMMARY = `
// // // BYD VEHICLE LINEUP AT BYD FAIRFIELD:

// // // ELECTRIC (BEV):
// // // - ATTO 1: From $23,990 | Compact SUV | 220–310km range | Blade Battery | Great first EV
// // // - ATTO 2: From $31,990 | Compact SUV | 345km range | 130kW | V2L capability
// // // - ATTO 3: From $39,990 | Compact SUV | 420km range | 150kW | Most popular compact EV
// // // - SEAL: From $52,990 | Sports sedan | 570km range (RWD) | Up to 390kW AWD | 3.8s 0-100
// // // - SEALION 7: Mid-size SUV | 456km range | 230kW or 390kW AWD | Premium tech
// // // - DOLPHIN: Compact hatchback | 427km range | City favourite | V2L | From ~$29,990

// // // PLUG-IN HYBRID (PHEV):
// // // - SEALION 5: PHEV SUV | DM-i tech | Long combined range | Affordable entry PHEV
// // // - SEALION 6: From ~$44,990 | Mid-size PHEV SUV | DM-i | FWD | Ultra-low fuel use
// // // - SEALION 8: 7-seat Super Hybrid SUV | DM-i/DM-p | Up to 359kW AWD | DiSus-C suspension
// // // - SHARK 6: From $57,900 | PHEV dual-cab ute | 321–350kW | 800km combined range | 3,500kg towing

// // // KEY TECH:
// // // - Blade Battery: BYD's safe LFP battery — passes nail penetration test, cobalt-free
// // // - V2L: Power external devices from the car battery
// // // - DM-i: Efficient hybrid system, electric-first driving
// // // - DM-p: Performance hybrid with AWD
// // // - DiSus-C: Adaptive damping suspension
// // // - OTA: Over-the-air updates
// // // - WARRANTY: 6 years vehicle / 8 years or 160,000km battery

// // // DEALERSHIP:
// // // - BYD Fairfield | 415 Heidelberg Road, Fairfield VIC 3078
// // // - Phone: 03 4110 8888 | bydfairfield.com.au
// // // - Test drives available 7 days
// // // `.trim();

// // // // ─── System Prompt ────────────────────────────────────────────────────────────
// // // function getSystemPrompt(carContext) {
// // //   const carContextBlock = carContext
// // //     ? `
// // // =============================================================
// // // ACTIVE CAR CONTEXT — THIS IS THE PRIMARY VEHICLE OF INTEREST
// // // =============================================================
// // // The caller has opened this voice session from the ${carContext} page.
// // // They are SPECIFICALLY interested in the ${carContext}.
// // // - Lead ALL responses with ${carContext}-specific information first.
// // // - Proactively mention ${carContext} specs, pricing, and features when relevant.
// // // - Your opening greeting MUST reference the ${carContext} by name.
// // // - If asked about other models, answer briefly then steer back to the ${carContext}.
// // // =============================================================
// // // `
// // //     : "";

// // //   return `
// // // =============================================================
// // // ABSOLUTE RULE — ENGLISH ONLY. THIS OVERRIDES EVERYTHING.
// // // =============================================================
// // // You MUST respond in English only. If the caller speaks another language,
// // // say: "Sorry, I can only assist in English at the moment."
// // // =============================================================

// // // ### IDENTITY ###
// // // You are the AI voice assistant for BYD Fairfield — an authorised BYD dealership at 415 Heidelberg Road, Fairfield VIC 3078.
// // // You handle inbound enquiries: vehicle information, test drive bookings, pricing, comparisons, finance questions, and general dealership enquiries.
// // // You sound like a friendly, knowledgeable Australian car sales consultant — warm, helpful, and enthusiastic about BYD.
// // // ${carContextBlock}
// // // ### AI DISCLOSURE ###
// // // - Do NOT volunteer that you are AI.
// // // - ONLY if explicitly asked "are you a robot / AI / real person?" — be honest:
// // //   "Good question — I'm actually an AI assistant helping the BYD Fairfield team. I can book test drives, answer questions about any BYD model, and help you find the right car. How can I help?"
// // // - Pivot straight back to helping them.

// // // ### PERSONALITY ###
// // // - Friendly, warm Australian manner
// // // - Genuinely enthusiastic about BYD's technology (Blade Battery, V2L, range etc.)
// // // - Never pushy — consultative and helpful
// // // - Natural fillers: "absolutely", "great question", "no worries", "sure thing", "for sure"
// // // - Match caller energy: relaxed with relaxed callers, efficient with busy ones

// // // ### HOW YOU TALK ###
// // // - SHORT responses — 1 to 2 sentences max
// // // - Contractions: "what's", "we've", "I'll", "you're", "that's"
// // // - ACKNOWLEDGE first, then respond
// // // - ONE question at a time — never stack questions
// // // - Silence/can't hear: "Still there?" or "Sorry, didn't catch that — could you say that again?"

// // // ### BYD VEHICLE KNOWLEDGE ###
// // // ${BYD_KNOWLEDGE_SUMMARY}

// // // QUICK RECOMMENDATIONS:
// // // - City / first EV → Atto 1, Atto 2, Dolphin
// // // - Family compact EV → Atto 3
// // // - Larger electric SUV → Sealion 7
// // // - Performance EV → Seal Performance
// // // - No range anxiety / long trips → Sealion 5, 6, 8 (PHEV) or Shark 6
// // // - 7-seat family hybrid → Sealion 8
// // // - Work ute / towing → Shark 6 Performance

// // // =============================================================
// // // CALL FLOW
// // // =============================================================

// // // STEP 01 — GREETING & INTENT
// // // ${
// // //   carContext
// // //     ? `The caller is already on the ${carContext} page — greet them and confirm their interest in the ${carContext} immediately.

// // // Start: "Thanks for calling BYD Fairfield! I can see you're checking out the ${carContext} — great choice. How can I help you with it today?"

// // // Then: "And who am I speaking with?"`
// // //     : `Greet first. Ask for name early. One question at a time.

// // // Start: "Thanks for calling BYD Fairfield — you're through to the front desk. How can I help you today?"

// // // Then: "Great — and who am I speaking with?"`
// // // }

// // // Use their name naturally once you have it.

// // // STEP 02 — VALUE PROP (for serious buyers only)
// // // Trigger for: test drive requests, purchase intent, serious comparisons.
// // // Skip for: quick info requests, direction questions.

// // // Script (adapt naturally):
// // // "We've got the full BYD range in stock at Fairfield — from the Dolphin city car right through to the Shark 6 ute. Every car comes with a 6-year warranty and BYD's industry-leading Blade Battery. We can arrange a test drive any day of the week — what's caught your eye?"

// // // STEP 03 — PROACTIVE CLOSE
// // // Never end passively. Always offer a next step.

// // // For TEST DRIVE:
// // // "I can lock that in for you — we've got slots tomorrow at 11am and Saturday at 10am. Which works better?"

// // // For PRICING:
// // // "The [model] starts from [price] drive-away. Would you like me to get one of our consultants to put together a personalised quote?"

// // // For COMPARISON:
// // // "[Model A] is the choice if you want [benefit A], while [Model B] suits [benefit B] better. Would you like to compare them in person with a test drive of both?"

// // // STEP 04 — COLLECT DETAILS (when booking)
// // // One detail at a time, conversationally:
// // // - Name (may already have)
// // // - Which vehicle they want to test / enquire about
// // // - Preferred date/time
// // // - Contact: phone or email

// // // =============================================================
// // // ESCALATION
// // // =============================================================
// // // ALWAYS escalate (log escalated: true) for:
// // // - Complaints or disputes
// // // - Finance / legal questions beyond general info
// // // - Abusive callers
// // // - Complex trade-in negotiations

// // // Script: "I want to make sure you get the best help with this — let me connect you with one of our consultants right now. Just one moment."

// // // =============================================================
// // // STEP 05 — SAVE CALL LOG (MANDATORY after every completed call)
// // // =============================================================
// // // After every call where intent was established, call save_call_log.

// // // Required: caller_name, intent_category, outcome
// // // Optional but important: caller_phone, caller_email, vehicle_interest, preferred_time, ai_summary, sentiment, confidence_score, escalated

// // // =============================================================
// // // HARD RULES
// // // =============================================================
// // // - ENGLISH ONLY
// // // - ONE question at a time
// // // - 1–2 sentences max per response
// // // - NEVER assume caller's name
// // // - ALWAYS call save_call_log after every completed call
// // // - Never give legal or finance advice beyond general info
// // // - Never make up pricing not in your knowledge base
// // // `.trim();
// // // }

// // // // ─── Tool Definition ──────────────────────────────────────────────────────────
// // // function getSaveCallLogTool() {
// // //   return {
// // //     type: "function",
// // //     name: "save_call_log",
// // //     description:
// // //       "Saves a structured call log after every completed BYD Fairfield call. MUST be called once intent is established and the call reaches a natural conclusion.",
// // //     parameters: {
// // //       type: "object",
// // //       properties: {
// // //         caller_name: { type: "string", description: "Full name of the caller" },
// // //         caller_phone: { type: "string", description: "Caller's phone number" },
// // //         caller_email: { type: "string", description: "Caller's email" },
// // //         vehicle_interest: {
// // //           type: "string",
// // //           description:
// // //             "Vehicle model they enquired about e.g. 'BYD Seal Performance', 'Shark 6'",
// // //         },
// // //         intent_category: {
// // //           type: "string",
// // //           enum: [
// // //             "vehicle_inquiry",
// // //             "test_drive_booking",
// // //             "pricing_inquiry",
// // //             "trade_in_inquiry",
// // //             "finance_inquiry",
// // //             "service_booking",
// // //             "general_enquiry",
// // //             "staff_transfer",
// // //             "comparison_request",
// // //             "availability_check",
// // //             "no_transcript_admin",
// // //           ],
// // //         },
// // //         preferred_time: {
// // //           type: "string",
// // //           description: "Booked or preferred time slot",
// // //         },
// // //         staff_requested: {
// // //           type: "string",
// // //           description: "Staff member requested by name",
// // //         },
// // //         outcome: {
// // //           type: "string",
// // //           enum: [
// // //             "test_drive_booked",
// // //             "callback_scheduled",
// // //             "transferred",
// // //             "info_provided",
// // //             "brochure_sent",
// // //             "message_taken",
// // //             "escalated",
// // //             "quote_provided",
// // //           ],
// // //         },
// // //         ai_summary: {
// // //           type: "string",
// // //           description: "1–2 sentence summary of the call",
// // //         },
// // //         sentiment: {
// // //           type: "string",
// // //           enum: ["positive", "neutral", "negative"],
// // //         },
// // //         confidence_score: { type: "number", description: "0.0 to 1.0" },
// // //         escalated: { type: "boolean" },
// // //       },
// // //       required: ["caller_name", "intent_category", "outcome"],
// // //     },
// // //   };
// // // }

// // // // ─── Recording (WAV builder) ──────────────────────────────────────────────────
// // // class ConversationRecorder {
// // //   constructor(sessionId) {
// // //     this.sessionId = sessionId;
// // //     this.userChunks = [];
// // //     this.agentChunks = [];
// // //     this.startTime = Date.now();
// // //     this.events = [];
// // //   }

// // //   addUserAudio(base64Pcm16) {
// // //     const buf = Buffer.from(base64Pcm16, "base64");
// // //     this.userChunks.push(buf);
// // //     this.events.push({
// // //       type: "user",
// // //       time: Date.now() - this.startTime,
// // //       bytes: buf.length,
// // //     });
// // //   }

// // //   addAgentAudio(base64Pcm16) {
// // //     const buf = Buffer.from(base64Pcm16, "base64");
// // //     this.agentChunks.push(buf);
// // //     this.events.push({
// // //       type: "agent",
// // //       time: Date.now() - this.startTime,
// // //       bytes: buf.length,
// // //     });
// // //   }

// // //   _resample(pcmBuffer, srcRate, dstRate) {
// // //     if (srcRate === dstRate) return pcmBuffer;
// // //     const srcSamples = pcmBuffer.length / 2;
// // //     const ratio = srcRate / dstRate;
// // //     const dstSamples = Math.floor(srcSamples / ratio);
// // //     const out = Buffer.alloc(dstSamples * 2);
// // //     for (let i = 0; i < dstSamples; i++) {
// // //       const srcIdx = i * ratio;
// // //       const lo = Math.floor(srcIdx);
// // //       const hi = Math.min(lo + 1, srcSamples - 1);
// // //       const frac = srcIdx - lo;
// // //       const sLo = pcmBuffer.readInt16LE(lo * 2);
// // //       const sHi = pcmBuffer.readInt16LE(hi * 2);
// // //       const val = Math.round(sLo + (sHi - sLo) * frac);
// // //       out.writeInt16LE(Math.max(-32768, Math.min(32767, val)), i * 2);
// // //     }
// // //     return out;
// // //   }

// // //   saveToFile() {
// // //     const OUTPUT_RATE = 24000;
// // //     const userPcm = Buffer.concat(this.userChunks);
// // //     const agentPcm = this._resample(
// // //       Buffer.concat(this.agentChunks),
// // //       16000,
// // //       OUTPUT_RATE,
// // //     );
// // //     const totalSamples = Math.max(userPcm.length / 2, agentPcm.length / 2);
// // //     const mixed = Buffer.alloc(totalSamples * 2);

// // //     for (let i = 0; i < totalSamples; i++) {
// // //       let v = 0;
// // //       if (i < userPcm.length / 2) v += userPcm.readInt16LE(i * 2);
// // //       if (i < agentPcm.length / 2) v += agentPcm.readInt16LE(i * 2);
// // //       mixed.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
// // //     }

// // //     const hdr = Buffer.alloc(44);
// // //     const dataSize = mixed.length;
// // //     hdr.write("RIFF", 0);
// // //     hdr.writeUInt32LE(36 + dataSize, 4);
// // //     hdr.write("WAVE", 8);
// // //     hdr.write("fmt ", 12);
// // //     hdr.writeUInt32LE(16, 16);
// // //     hdr.writeUInt16LE(1, 20);
// // //     hdr.writeUInt16LE(1, 22);
// // //     hdr.writeUInt32LE(OUTPUT_RATE, 24);
// // //     hdr.writeUInt32LE(OUTPUT_RATE * 2, 28);
// // //     hdr.writeUInt16LE(2, 32);
// // //     hdr.writeUInt16LE(16, 34);
// // //     hdr.write("data", 36);
// // //     hdr.writeUInt32LE(dataSize, 40);

// // //     const wav = Buffer.concat([hdr, mixed]);
// // //     const filename = `byd_call_${this.sessionId}_${Date.now()}.wav`;
// // //     const filepath = path.join(RECORDINGS_DIR, filename);
// // //     fs.writeFileSync(filepath, wav);
// // //     console.log(
// // //       `[Recording] Saved: ${filename} (${(wav.length / 1024 / 1024).toFixed(2)} MB)`,
// // //     );
// // //     return {
// // //       filename,
// // //       filepath,
// // //       sizeMB: (wav.length / 1024 / 1024).toFixed(2),
// // //     };
// // //   }
// // // }

// // // // ─── Helpers ──────────────────────────────────────────────────────────────────
// // // function sendWsJson(ws, payload) {
// // //   if (!ws || ws.readyState !== WebSocket.OPEN) return false;
// // //   ws.send(JSON.stringify(payload));
// // //   return true;
// // // }

// // // function safeJsonParse(text) {
// // //   try {
// // //     return JSON.parse(text);
// // //   } catch {
// // //     return null;
// // //   }
// // // }

// // // function toFunctionCallPayload(value) {
// // //   if (!value || typeof value !== "object") return null;

// // //   if (
// // //     value.type === "function_call" &&
// // //     typeof value.name === "string" &&
// // //     typeof value.arguments === "string" &&
// // //     typeof value.call_id === "string"
// // //   ) {
// // //     return {
// // //       name: value.name,
// // //       arguments: value.arguments,
// // //       call_id: value.call_id,
// // //     };
// // //   }

// // //   if (
// // //     typeof value.name === "string" &&
// // //     typeof value.arguments === "string" &&
// // //     typeof value.call_id === "string"
// // //   ) {
// // //     return {
// // //       name: value.name,
// // //       arguments: value.arguments,
// // //       call_id: value.call_id,
// // //     };
// // //   }

// // //   return null;
// // // }

// // // function extractFunctionCallsFromResponse(response) {
// // //   const calls = [];
// // //   const output = response?.output;
// // //   if (Array.isArray(output)) {
// // //     for (const item of output) {
// // //       const fc = toFunctionCallPayload(item);
// // //       if (fc) calls.push(fc);
// // //     }
// // //   }
// // //   return calls;
// // // }

// // // // ─── End-of-call summary generator ────────────────────────────────────────────
// // // // Uses a plain OpenAI Chat Completions call (not the realtime socket) to turn
// // // // the accumulated transcript into a structured summary once the call ends.
// // // async function generateCallSummary(transcriptArray) {
// // //   if (!transcriptArray || transcriptArray.length === 0) {
// // //     return {
// // //       summary: "No conversation took place.",
// // //       sentiment: "neutral",
// // //       intent_category: "no_transcript_admin",
// // //       outcome: "message_taken",
// // //       caller_name: null,
// // //       vehicle_interest: null,
// // //       confidence_score: 0,
// // //     };
// // //   }

// // //   const conversationText = transcriptArray
// // //     .map((t) => `${t.role === "user" ? "Caller" : "Agent"}: ${t.text}`)
// // //     .join("\n");

// // //   const prompt = `You are summarizing a phone call transcript from a BYD Fairfield dealership voice agent.

// // // TRANSCRIPT:
// // // ${conversationText}

// // // Return ONLY a JSON object (no markdown, no preamble) with these fields:
// // // {
// // //   "summary": "2-3 sentence summary of what happened on the call",
// // //   "sentiment": "positive" | "neutral" | "negative",
// // //   "intent_category": one of ["vehicle_inquiry","test_drive_booking","pricing_inquiry","trade_in_inquiry","finance_inquiry","service_booking","general_enquiry","staff_transfer","comparison_request","availability_check","no_transcript_admin"],
// // //   "outcome": one of ["test_drive_booked","callback_scheduled","transferred","info_provided","brochure_sent","message_taken","escalated","quote_provided"],
// // //   "caller_name": "name if mentioned, else null",
// // //   "vehicle_interest": "vehicle model if mentioned, else null",
// // //   "confidence_score": number between 0 and 1
// // // }`;

// // //   try {
// // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // //       method: "POST",
// // //       headers: {
// // //         "Content-Type": "application/json",
// // //         Authorization: `Bearer ${OPENAI_API_KEY}`,
// // //       },
// // //       body: JSON.stringify({
// // //         model: OPENAI_SUMMARY_MODEL,
// // //         messages: [{ role: "user", content: prompt }],
// // //         response_format: { type: "json_object" },
// // //         temperature: 0.3,
// // //       }),
// // //     });

// // //     const data = await response.json();
// // //     const raw = data?.choices?.[0]?.message?.content;
// // //     if (!raw) throw new Error("No content returned from summary model");

// // //     return JSON.parse(raw);
// // //   } catch (err) {
// // //     console.error("Summary generation failed:", err.message);
// // //     return {
// // //       summary: "Summary generation failed.",
// // //       sentiment: "neutral",
// // //       intent_category: "no_transcript_admin",
// // //       outcome: "message_taken",
// // //       caller_name: null,
// // //       vehicle_interest: null,
// // //       confidence_score: 0,
// // //     };
// // //   }
// // // }

// // // // ─── OpenAI Realtime Session ──────────────────────────────────────────────────
// // // function createRealtimeSession(sessionId, onEvent, carContext) {
// // //   const url = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
// // //   const startMs = Date.now();

// // //   return new Promise((resolve, reject) => {
// // //     const ws = new WebSocket(url, {
// // //       headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
// // //     });

// // //     ws.on("open", () => {
// // //       console.log(
// // //         `[${sessionId}] OpenAI Realtime connected (${Date.now() - startMs}ms)${carContext ? ` | Car context: ${carContext}` : ""}`,
// // //       );

// // //       sendWsJson(ws, {
// // //         type: "session.update",
// // //         session: {
// // //           type: "realtime",
// // //           model: OPENAI_REALTIME_MODEL,
// // //           output_modalities: ["text"],
// // //           audio: {
// // //             input: {
// // //               format: {
// // //                 type: "audio/pcm",
// // //                 rate: OPENAI_INPUT_SAMPLE_RATE,
// // //               },
// // //               turn_detection: {
// // //                 type: "server_vad",
// // //                 threshold: OPENAI_VAD_THRESHOLD,
// // //                 prefix_padding_ms: OPENAI_VAD_PREFIX_PADDING_MS,
// // //                 silence_duration_ms: OPENAI_VAD_SILENCE_DURATION_MS,
// // //               },
// // //             },
// // //           },
// // //           // Pass carContext into the system prompt
// // //           instructions: getSystemPrompt(carContext || null),
// // //           tools: [getSaveCallLogTool()],
// // //           tool_choice: "auto",
// // //         },
// // //       });

// // //       const session = {
// // //         ws,
// // //         carContext: carContext || null,
// // //         elevenLabsWs: null,
// // //         elevenLabsReady: false,
// // //         textBuffer: [],
// // //         isResponseActive: false,
// // //         onEvent,
// // //         startMs,
// // //         openAiConnectedMs: Date.now(),
// // //         elevenLabsConnectedMs: null,
// // //         greetingTriggeredMs: null,
// // //         firstResponseCreatedMs: null,
// // //         firstAudioDeltaLogged: false,
// // //         processedCallIds: new Set(),
// // //         recorder: new ConversationRecorder(sessionId),
// // //         callLogs: [],
// // //         elevenLabsOpening: false,
// // //         transcript: [], // full conversation transcript { role, text, ts }
// // //         currentAssistantText: "", // accumulates streaming text deltas
// // //       };

// // //       sessions.set(sessionId, session);
// // //       openElevenLabsStream(sessionId);
// // //       resolve();
// // //     });

// // //     ws.on("message", async (data) => {
// // //       try {
// // //         const event = JSON.parse(data.toString());
// // //         await handleRealtimeEvent(sessionId, event);
// // //       } catch (err) {
// // //         console.error(`[${sessionId}] Parse error:`, err.message);
// // //       }
// // //     });

// // //     ws.on("error", (err) => {
// // //       console.error(`[${sessionId}] OpenAI WS error:`, err.message);
// // //       onEvent({ type: "error", error: { message: err.message } });
// // //       reject(err);
// // //     });

// // //     ws.on("close", (code) => {
// // //       console.log(`[${sessionId}] OpenAI WS closed: ${code}`);
// // //       closeElevenLabsWs(sessionId);
// // //       sessions.delete(sessionId);
// // //       onEvent({ type: "session-closed" });
// // //     });
// // //   });
// // // }

// // // // ─── Audio helpers ────────────────────────────────────────────────────────────
// // // function sendAudio(sessionId, base64Audio) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;
// // //   session.recorder.addUserAudio(base64Audio);
// // //   sendWsJson(session.ws, {
// // //     type: "input_audio_buffer.append",
// // //     audio: base64Audio,
// // //   });
// // // }

// // // // ─── Trigger greeting — car-context-aware ─────────────────────────────────────
// // // function triggerGreeting(sessionId) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;
// // //   session.greetingTriggeredMs = Date.now();
// // //   console.log(
// // //     `[${sessionId}] Greeting triggered (${session.greetingTriggeredMs - session.startMs}ms)`,
// // //   );

// // //   if (session.carContext) {
// // //     const primeMessage =
// // //       `The caller has just opened the voice assistant from the ${session.carContext} page. ` +
// // //       `They are interested in the ${session.carContext}. ` +
// // //       `Greet them warmly and reference the ${session.carContext} by name in your opening line.`;

// // //     sendWsJson(session.ws, {
// // //       type: "conversation.item.create",
// // //       item: {
// // //         type: "message",
// // //         role: "user",
// // //         content: [{ type: "input_text", text: primeMessage }],
// // //       },
// // //     });
// // //   }

// // //   sendWsJson(session.ws, { type: "response.create" });
// // // }

// // // // ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

// // // function _openNewElevenLabsStream(sessionId) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;

// // //   if (session.elevenLabsOpening) {
// // //     console.log(`[${sessionId}] ElevenLabs open already in-flight, skipping`);
// // //     return;
// // //   }
// // //   session.elevenLabsOpening = true;

// // //   const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream-input?model_id=eleven_multilingual_v2&output_format=pcm_16000`;
// // //   const elWs = new WebSocket(wsUrl);

// // //   elWs.on("open", () => {
// // //     if (!sessions.has(sessionId) || session.elevenLabsWs !== elWs) {
// // //       elWs.close();
// // //       return;
// // //     }

// // //     console.log(`[${sessionId}] ElevenLabs connected`);
// // //     session.elevenLabsConnectedMs = Date.now();
// // //     session.elevenLabsOpening = false;

// // //     elWs.send(
// // //       JSON.stringify({
// // //         text: " ",
// // //         voice_settings: {
// // //           stability: 0.5,
// // //           similarity_boost: 0.8,
// // //           style: 0.3,
// // //           use_speaker_boost: true,
// // //         },
// // //         xi_api_key: ELEVENLABS_API_KEY,
// // //       }),
// // //     );

// // //     session.elevenLabsReady = true;
// // //     for (const text of session.textBuffer) {
// // //       if (elWs.readyState === WebSocket.OPEN) {
// // //         elWs.send(JSON.stringify({ text, try_trigger_generation: true }));
// // //       }
// // //     }
// // //     session.textBuffer = [];
// // //   });

// // //   elWs.on("message", (data) => {
// // //     try {
// // //       const msg = JSON.parse(data.toString());
// // //       if (msg.audio) {
// // //         session.recorder.addAgentAudio(msg.audio);
// // //         session.onEvent({ type: "audio-delta", delta: msg.audio });
// // //       }
// // //     } catch {}
// // //   });

// // //   elWs.on("error", (err) => {
// // //     console.warn(`[${sessionId}] ElevenLabs error: ${err.message}`);
// // //     session.elevenLabsOpening = false;
// // //   });

// // //   elWs.on("close", () => {
// // //     if (session.elevenLabsWs === elWs) {
// // //       session.elevenLabsReady = false;
// // //       session.elevenLabsOpening = false;
// // //     }
// // //   });

// // //   session.elevenLabsWs = elWs;
// // // }

// // // function openElevenLabsStream(sessionId, force = false) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;

// // //   const oldWs = session.elevenLabsWs;

// // //   if (!force) {
// // //     if (
// // //       oldWs &&
// // //       (oldWs.readyState === WebSocket.OPEN ||
// // //         oldWs.readyState === WebSocket.CONNECTING)
// // //     ) {
// // //       return;
// // //     }
// // //     _openNewElevenLabsStream(sessionId);
// // //     return;
// // //   }

// // //   session.textBuffer = [];
// // //   session.elevenLabsReady = false;

// // //   if (
// // //     !oldWs ||
// // //     oldWs.readyState === WebSocket.CLOSED ||
// // //     oldWs.readyState === WebSocket.CLOSING
// // //   ) {
// // //     session.elevenLabsWs = null;
// // //     session.elevenLabsOpening = false;
// // //     _openNewElevenLabsStream(sessionId);
// // //     return;
// // //   }

// // //   if (oldWs.readyState === WebSocket.CONNECTING) {
// // //     session.elevenLabsWs = null;
// // //     session.elevenLabsOpening = false;
// // //     try {
// // //       oldWs.terminate();
// // //     } catch (_) {}
// // //     _openNewElevenLabsStream(sessionId);
// // //     return;
// // //   }

// // //   session.elevenLabsWs = null;
// // //   session.elevenLabsOpening = false;

// // //   try {
// // //     oldWs.send(JSON.stringify({ text: "" }));
// // //   } catch (_) {}

// // //   oldWs.once("close", () => {
// // //     if (!sessions.has(sessionId)) return;
// // //     const s = sessions.get(sessionId);
// // //     if (s && !s.elevenLabsWs && !s.elevenLabsOpening) {
// // //       _openNewElevenLabsStream(sessionId);
// // //     }
// // //   });

// // //   setTimeout(() => {
// // //     if (!sessions.has(sessionId)) return;
// // //     const s = sessions.get(sessionId);
// // //     if (s && !s.elevenLabsWs && !s.elevenLabsOpening) {
// // //       console.warn(`[${sessionId}] ElevenLabs close timeout — forcing open`);
// // //       _openNewElevenLabsStream(sessionId);
// // //     }
// // //   }, 800);

// // //   try {
// // //     oldWs.close();
// // //   } catch (_) {}
// // // }

// // // function sendTextToElevenLabs(sessionId, text) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;
// // //   if (
// // //     session.elevenLabsWs?.readyState === WebSocket.OPEN &&
// // //     session.elevenLabsReady
// // //   ) {
// // //     session.elevenLabsWs.send(
// // //       JSON.stringify({ text, try_trigger_generation: true }),
// // //     );
// // //   } else {
// // //     session.textBuffer.push(text);
// // //   }
// // // }

// // // function flushElevenLabsStream(sessionId) {
// // //   const session = sessions.get(sessionId);
// // //   if (session?.elevenLabsWs?.readyState === WebSocket.OPEN) {
// // //     session.elevenLabsWs.send(JSON.stringify({ text: "" }));
// // //   }
// // // }

// // // function closeElevenLabsWs(sessionId) {
// // //   const session = sessions.get(sessionId);
// // //   if (session?.elevenLabsWs) {
// // //     try {
// // //       if (session.elevenLabsWs.readyState === WebSocket.CONNECTING)
// // //         session.elevenLabsWs.terminate();
// // //       else if (session.elevenLabsWs.readyState === WebSocket.OPEN)
// // //         session.elevenLabsWs.close();
// // //     } catch {}
// // //     session.elevenLabsWs = null;
// // //     session.elevenLabsReady = false;
// // //     session.elevenLabsOpening = false;
// // //     session.textBuffer = [];
// // //   }
// // // }

// // // // ─── Function call handler ────────────────────────────────────────────────────
// // // async function handleFunctionCall(sessionId, eventOrItem) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;

// // //   const call = toFunctionCallPayload(eventOrItem);
// // //   if (!call || call.name !== "save_call_log") return;

// // //   const callId = typeof call.call_id === "string" ? call.call_id : null;
// // //   if (callId && session.processedCallIds.has(callId)) return;
// // //   if (callId) session.processedCallIds.add(callId);

// // //   try {
// // //     const args = JSON.parse(call.arguments);
// // //     console.log(
// // //       `[${sessionId}] Saving call log | name: ${args.caller_name} | intent: ${args.intent_category} | outcome: ${args.outcome}`,
// // //     );

// // //     const logId = uuidv4();
// // //     const callLog = new CallLog({
// // //       id: logId,
// // //       sessionId,
// // //       caller_name: args.caller_name || null,
// // //       caller_phone: args.caller_phone || null,
// // //       caller_email: args.caller_email || null,
// // //       // Auto-populate vehicle_interest from carContext if AI didn't extract one
// // //       vehicle_interest: args.vehicle_interest || session.carContext || null,
// // //       intent_category: args.intent_category,
// // //       preferred_time: args.preferred_time || null,
// // //       staff_requested: args.staff_requested || null,
// // //       outcome: args.outcome,
// // //       ai_summary: args.ai_summary || null,
// // //       sentiment: args.sentiment || "neutral",
// // //       confidence_score: args.confidence_score || null,
// // //       escalated: args.escalated || false,
// // //       full_transcript: session.transcript || [],
// // //     });

// // //     await callLog.save();
// // //     session.callLogs.push({ id: logId, ...args });
// // //     console.log(`[${sessionId}] Call log saved to MongoDB: ${logId}`);

// // //     sendWsJson(session.ws, {
// // //       type: "conversation.item.create",
// // //       item: {
// // //         type: "function_call_output",
// // //         call_id: call.call_id,
// // //         output: JSON.stringify({
// // //           success: true,
// // //           message: "Call log saved successfully.",
// // //           log_id: logId,
// // //           outcome: args.outcome,
// // //         }),
// // //       },
// // //     });
// // //     sendWsJson(session.ws, { type: "response.create" });
// // //     session.onEvent({ type: "call-logged", data: args });
// // //   } catch (err) {
// // //     if (callId) session.processedCallIds.delete(callId);
// // //     console.error(`[${sessionId}] Call log save failed:`, err.message);
// // //   }
// // // }

// // // // ─── OpenAI Event handler ─────────────────────────────────────────────────────
// // // async function handleRealtimeEvent(sessionId, event) {
// // //   const session = sessions.get(sessionId);
// // //   if (!session) return;

// // //   switch (event.type) {
// // //     case "session.created":
// // //     case "session.updated":
// // //       break;

// // //     case "response.created":
// // //       session.isResponseActive = true;
// // //       session.currentAssistantText = ""; // reset accumulator for new turn
// // //       if (!session.firstResponseCreatedMs) {
// // //         session.firstResponseCreatedMs = Date.now();
// // //       }
// // //       if (
// // //         !session.elevenLabsWs ||
// // //         (session.elevenLabsWs.readyState !== WebSocket.OPEN &&
// // //           session.elevenLabsWs.readyState !== WebSocket.CONNECTING)
// // //       ) {
// // //         openElevenLabsStream(sessionId);
// // //       }
// // //       break;

// // //     case "response.output_text.delta":
// // //     case "response.text.delta":
// // //       sendTextToElevenLabs(sessionId, event.delta);
// // //       session.currentAssistantText += event.delta || "";
// // //       session.onEvent({ type: "transcript-delta", delta: event.delta });
// // //       break;

// // //     // Audio transcript deltas — companion text when modalities includes audio
// // //     case "response.audio_transcript.delta":
// // //       sendTextToElevenLabs(sessionId, event.delta);
// // //       session.currentAssistantText += event.delta || "";
// // //       session.onEvent({ type: "transcript-delta", delta: event.delta });
// // //       break;

// // //     // Native OpenAI audio — fallback if ElevenLabs is not connected
// // //     case "response.audio.delta":
// // //       if (event.delta) {
// // //         if (
// // //           !session.elevenLabsWs ||
// // //           session.elevenLabsWs.readyState !== WebSocket.OPEN
// // //         ) {
// // //           session.recorder.addAgentAudio(event.delta);
// // //           session.onEvent({ type: "audio-delta", delta: event.delta });
// // //         }
// // //       }
// // //       break;

// // //     case "response.audio.done":
// // //       break;

// // //     case "response.output_text.done":
// // //     case "response.text.done": {
// // //       flushElevenLabsStream(sessionId);
// // //       // push finished assistant turn into transcript
// // //       const assistantText = (
// // //         event.text ||
// // //         session.currentAssistantText ||
// // //         ""
// // //       ).trim();
// // //       if (assistantText) {
// // //         session.transcript.push({
// // //           role: "assistant",
// // //           text: assistantText,
// // //           ts: Date.now(),
// // //         });
// // //       }
// // //       session.currentAssistantText = "";
// // //       session.onEvent({ type: "transcript-done", transcript: event.text });
// // //       break;
// // //     }

// // //     case "response.audio_transcript.done": {
// // //       flushElevenLabsStream(sessionId);
// // //       const aText = (event.transcript || session.currentAssistantText || "").trim();
// // //       if (aText) {
// // //         session.transcript.push({ role: "assistant", text: aText, ts: Date.now() });
// // //       }
// // //       session.currentAssistantText = "";
// // //       session.onEvent({ type: "transcript-done", transcript: event.transcript });
// // //       break;
// // //     }

// // //     case "response.done": {
// // //       session.isResponseActive = false;
// // //       const calls = extractFunctionCallsFromResponse(event.response);
// // //       for (const fc of calls) await handleFunctionCall(sessionId, fc);
// // //       break;
// // //     }

// // //     case "response.output_item.done":
// // //       if (event.item) {
// // //         const fc = toFunctionCallPayload(event.item);
// // //         if (fc) await handleFunctionCall(sessionId, fc);
// // //       }
// // //       break;

// // //     case "response.function_call_arguments.done":
// // //       await handleFunctionCall(sessionId, event);
// // //       break;

// // //     case "input_audio_buffer.speech_started":
// // //       console.log(`[${sessionId}] User speech started (VAD)`);

// // //       if (session.isResponseActive) {
// // //         console.log(`[${sessionId}] User interrupted — stopping AI voice`);
// // //         sendWsJson(session.ws, { type: "response.cancel" });
// // //         session.isResponseActive = false;
// // //         openElevenLabsStream(sessionId, true); // Force restart ElevenLabs stream to cut off audio instantly
// // //       }

// // //       session.onEvent({ type: "speech-started" });
// // //       break;

// // //     case "input_audio_buffer.speech_stopped":
// // //       console.log(`[${sessionId}] User speech stopped (VAD)`);
// // //       break;

// // //     case "input_audio_buffer.committed":
// // //       console.log(`[${sessionId}] Audio buffer committed — AI generating`);
// // //       break;

// // //     case "conversation.item.input_audio_transcription.completed":
// // //       // push user turn into transcript
// // //       if (event.transcript && event.transcript.trim()) {
// // //         session.transcript.push({
// // //           role: "user",
// // //           text: event.transcript.trim(),
// // //           ts: Date.now(),
// // //         });
// // //       }
// // //       session.onEvent({
// // //         type: "user-transcript",
// // //         transcript: event.transcript,
// // //       });
// // //       break;

// // //     case "error":
// // //       if (event.error && event.error.code === "response_cancel_not_active") {
// // //         // Harmless race condition when VAD triggers a cancel right as a response finishes
// // //         console.log(`[${sessionId}] Ignored response_cancel_not_active error`);
// // //         break;
// // //       }
// // //       console.error(
// // //         `[${sessionId}] OpenAI error:`,
// // //         JSON.stringify(event.error),
// // //       );
// // //       session.onEvent({ type: "error", error: event.error });
// // //       break;

// // //     default:
// // //       break;
// // //   }
// // // }

// // // // ─── Close session ────────────────────────────────────────────────────────────
// // // async function closeSession(sessionId) {
// // //   const session = sessions.get(sessionId);
// // //   if (session) {
// // //     // FIX: skip the save/summary pipeline entirely for sessions that never
// // //     // had a real conversation (e.g. idle prewarm sessions that got closed or
// // //     // replaced before the caller said anything). Previously this always ran,
// // //     // which meant every page load / reconnect / car-context switch wrote a
// // //     // junk "No conversation took place" row to Mongo and burned an extra
// // //     // OpenAI chat-completions call for nothing.
// // //     const hadConversation = session.transcript && session.transcript.length > 0;

// // //     if (hadConversation) {
// // //       try {
// // //         const result = session.recorder.saveToFile();
// // //         session.onEvent({
// // //           type: "recording-saved",
// // //           data: {
// // //             filename: result.filename,
// // //             url: `/recordings/${result.filename}`,
// // //           },
// // //         });
// // //       } catch (err) {
// // //         console.error(`[${sessionId}] Recording save failed:`, err.message);
// // //       }

// // //       try {
// // //         const summaryData = await generateCallSummary(session.transcript);

// // //         session.onEvent({
// // //           type: "call-summary",
// // //           data: {
// // //             ...summaryData,
// // //             fullTranscript: session.transcript,
// // //           },
// // //         });

// // //         // Only persist a new log if save_call_log wasn't already called mid-call
// // //         // (avoids duplicate entries — the tool-based log already has full_transcript)
// // //         if (session.callLogs.length === 0) {
// // //           const logId = uuidv4();
// // //           const callLog = new CallLog({
// // //             id: logId,
// // //             sessionId,
// // //             caller_name: summaryData.caller_name || null,
// // //             vehicle_interest:
// // //               summaryData.vehicle_interest || session.carContext || null,
// // //             intent_category:
// // //               summaryData.intent_category || "no_transcript_admin",
// // //             outcome: summaryData.outcome || "message_taken",
// // //             ai_summary: summaryData.summary || null,
// // //             sentiment: summaryData.sentiment || "neutral",
// // //             confidence_score: summaryData.confidence_score ?? null,
// // //             escalated: false,
// // //             full_transcript: session.transcript || [],
// // //           });
// // //           await callLog.save();
// // //           console.log(`[${sessionId}] End-of-call summary saved: ${logId}`);
// // //         }
// // //       } catch (err) {
// // //         console.error(
// // //           `[${sessionId}] Summary generation/save failed:`,
// // //           err.message,
// // //         );
// // //       }
// // //     } else {
// // //       console.log(
// // //         `[${sessionId}] Closing empty session — skipping recording/summary/save`,
// // //       );
// // //     }

// // //     closeElevenLabsWs(sessionId);
// // //     try {
// // //       session.ws.close();
// // //     } catch {}
// // //     sessions.delete(sessionId);
// // //     console.log(`[${sessionId}] Session closed`);
// // //   }
// // // }

// // // // ─── Prewarm ──────────────────────────────────────────────────────────────────
// // // function clearPrewarmState(sessionId) {
// // //   const state = prewarmStates.get(sessionId);
// // //   if (!state) return;
// // //   clearTimeout(state.ttlTimer);
// // //   prewarmStates.delete(sessionId);
// // // }

// // // function startPrewarm(sessionId, eventForwarder) {
// // //   if (prewarmStates.has(sessionId)) return prewarmStates.get(sessionId).promise;

// // //   const state = { promise: null, ready: false, failed: false, ttlTimer: null };

// // //   state.promise = createRealtimeSession(sessionId, eventForwarder, null)
// // //     .then(() => {
// // //       state.ready = true;
// // //       console.log(`[${sessionId}] Prewarm ready`);
// // //     })
// // //     .catch((err) => {
// // //       state.failed = true;
// // //       console.warn(`[${sessionId}] Prewarm failed: ${err.message}`);
// // //       throw err;
// // //     });

// // //   state.ttlTimer = setTimeout(() => {
// // //     if (!prewarmStates.has(sessionId)) return;
// // //     console.log(`[${sessionId}] Prewarm TTL expired — closing idle session`);
// // //     clearPrewarmState(sessionId);
// // //     closeSession(sessionId);
// // //   }, PREWARM_TTL_MS);

// // //   prewarmStates.set(sessionId, state);
// // //   return state.promise;
// // // }

// // // // ─── Event Forwarder ──────────────────────────────────────────────────────────
// // // function buildEventForwarder(socket) {
// // //   return (event) => {
// // //     switch (event.type) {
// // //       case "audio-delta":
// // //         socket.emit("audio-delta", { delta: event.delta });
// // //         break;
// // //       case "transcript-delta":
// // //         socket.emit("transcript-delta", { delta: event.delta });
// // //         break;
// // //       case "transcript-done":
// // //         socket.emit("transcript-done", { transcript: event.transcript });
// // //         break;
// // //       case "user-transcript":
// // //         socket.emit("user-transcript", { transcript: event.transcript });
// // //         break;
// // //       case "speech-started":
// // //         socket.emit("speech-started", {});
// // //         break;
// // //       case "call-logged":
// // //         socket.emit("call-logged", event.data);
// // //         break;
// // //       case "call-summary":
// // //         socket.emit("call-summary", event.data);
// // //         break;
// // //       case "recording-saved":
// // //         socket.emit("recording-saved", event.data);
// // //         break;
// // //       case "error":
// // //         socket.emit("realtime-error", { error: event.error });
// // //         break;
// // //       case "session-closed":
// // //         socket.emit("session-closed", {});
// // //         break;
// // //     }
// // //   };
// // // }

// // // // ─── Socket.IO ────────────────────────────────────────────────────────────────
// // // io.on("connection", (socket) => {
// // //   console.log(`Client connected: ${socket.id}`);
// // //   const forwarder = buildEventForwarder(socket);

// // //   // FIX: debounce prewarm instead of firing it instantly on every connect.
// // //   // This avoids opening a real OpenAI Realtime WS + ElevenLabs WS for
// // //   // transient connections (React StrictMode double-mount, fast refresh,
// // //   // brief network blips) that disconnect again within a few hundred ms.
// // //   const prewarmTimer = setTimeout(() => {
// // //     prewarmTimers.delete(socket.id);
// // //     startPrewarm(socket.id, forwarder).catch(() => {});
// // //   }, PREWARM_CONNECT_DELAY_MS);
// // //   prewarmTimers.set(socket.id, prewarmTimer);

// // //   socket.on("start-session", async (data) => {
// // //     const sessionId = socket.id;
// // //     const carContext = data?.carContext || null;
// // //     console.log(
// // //       `[${sessionId}] Starting voice session${carContext ? ` | Car: ${carContext}` : ""}`,
// // //     );

// // //     // If prewarm hasn't fired yet, cancel it — we're about to create the
// // //     // session ourselves (either reusing logic below or with carContext).
// // //     const pendingPrewarm = prewarmTimers.get(sessionId);
// // //     if (pendingPrewarm) {
// // //       clearTimeout(pendingPrewarm);
// // //       prewarmTimers.delete(sessionId);
// // //     }

// // //     try {
// // //       if (carContext) {
// // //         clearPrewarmState(sessionId);
// // //         await closeSession(sessionId);

// // //         await createRealtimeSession(sessionId, forwarder, carContext);
// // //         socket.emit("session-started", { sessionId });
// // //         triggerGreeting(sessionId);
// // //         return;
// // //       }

// // //       let state = prewarmStates.get(sessionId);
// // //       if (!state) {
// // //         await startPrewarm(sessionId, forwarder);
// // //         state = prewarmStates.get(sessionId);
// // //       }
// // //       if (state) {
// // //         try {
// // //           await state.promise;
// // //           if (state.ready) {
// // //             clearPrewarmState(sessionId);
// // //             socket.emit("session-started", { sessionId });
// // //             triggerGreeting(sessionId);
// // //             return;
// // //           }
// // //         } catch {}
// // //         clearPrewarmState(sessionId);
// // //       }

// // //       await createRealtimeSession(sessionId, forwarder, null);
// // //       socket.emit("session-started", { sessionId });
// // //       triggerGreeting(sessionId);
// // //     } catch (err) {
// // //       console.error(`[${sessionId}] Session start failed:`, err.message);
// // //       socket.emit("realtime-error", {
// // //         error: { message: "Failed to connect to AI service" },
// // //       });
// // //     }
// // //   });

// // //   socket.on("audio-chunk", (data) => {
// // //     if (data?.audio) sendAudio(socket.id, data.audio);
// // //   });

// // //   // client can request the live transcript at any point during the call
// // //   socket.on("get-transcript", () => {
// // //     const session = sessions.get(socket.id);
// // //     socket.emit("transcript-state", {
// // //       transcript: session?.transcript || [],
// // //     });
// // //   });

// // //   socket.on("end-session", async () => {
// // //     console.log(`[${socket.id}] End session requested`);
// // //     clearPrewarmState(socket.id);
// // //     await closeSession(socket.id); // summary is generated before this resolves (if there was a conversation)
// // //     socket.emit("session-closed", {});
// // //   });

// // //   socket.on("disconnect", async () => {
// // //     console.log(`Client disconnected: ${socket.id}`);

// // //     // Cancel any pending debounced prewarm so a fast connect/disconnect
// // //     // cycle never opens a real connection at all.
// // //     const pendingPrewarm = prewarmTimers.get(socket.id);
// // //     if (pendingPrewarm) {
// // //       clearTimeout(pendingPrewarm);
// // //       prewarmTimers.delete(socket.id);
// // //     }

// // //     clearPrewarmState(socket.id);
// // //     await closeSession(socket.id);
// // //   });
// // // });

// // // // ─── REST Endpoints ───────────────────────────────────────────────────────────
// // // app.get("/api/call-logs", async (req, res) => {
// // //   try {
// // //     const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
// // //     res.json(logs);
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Failed to fetch call logs" });
// // //   }
// // // });

// // // app.get("/api/call-logs/intent/:intent", async (req, res) => {
// // //   try {
// // //     const logs = await CallLog.find({ intent_category: req.params.intent })
// // //       .sort({ createdAt: -1 })
// // //       .lean();
// // //     res.json(logs);
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Failed to fetch call logs" });
// // //   }
// // // });

// // // app.get("/api/recordings", (req, res) => {
// // //   const files = fs
// // //     .readdirSync(RECORDINGS_DIR)
// // //     .filter((f) => f.endsWith(".wav"));
// // //   res.json(
// // //     files.map((f) => ({
// // //       filename: f,
// // //       url: `/recordings/${f}`,
// // //       size:
// // //         (fs.statSync(path.join(RECORDINGS_DIR, f)).size / 1024 / 1024).toFixed(
// // //           2,
// // //         ) + " MB",
// // //     })),
// // //   );
// // // });

// // // // standalone summary endpoint — pass { transcript: [{role, text}, ...] }
// // // app.post("/api/summary", async (req, res) => {
// // //   try {
// // //     const { transcript } = req.body;
// // //     if (!Array.isArray(transcript)) {
// // //       return res.status(400).json({ error: "transcript must be an array" });
// // //     }
// // //     const summary = await generateCallSummary(transcript);
// // //     res.json(summary);
// // //   } catch (err) {
// // //     console.error("Summary endpoint failed:", err.message);
// // //     res.status(500).json({ error: "Failed to generate summary" });
// // //   }
// // // });

// // // app.get("/api/health", (req, res) =>
// // //   res.json({ status: "ok", sessions: sessions.size }),
// // // );

// // // // ─── Start ────────────────────────────────────────────────────────────────────
// // // server.listen(PORT, () => {
// // //   console.log(`
// // // ╔══════════════════════════════════════════════════════════════╗
// // // ║   BYD Fairfield — AI Voice Agent (OmniSuiteAI)               ║
// // // ║   Running on http://localhost:${PORT}                         ║
// // // ║                                                              ║
// // // ║   Model:          ${OPENAI_REALTIME_MODEL}                   ║
// // // ║   Summary Model:  ${OPENAI_SUMMARY_MODEL}                    ║
// // // ║   OpenAI API Key: ${OPENAI_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// // // ║   ElevenLabs Key: ${ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// // // ║   Voice ID:       ${ELEVENLABS_VOICE_ID}                     ║
// // // ║   MongoDB:        ${MONGODB_URI ? "✓ Set" : "✗ Missing"}                             ║
// // // ╚══════════════════════════════════════════════════════════════╝
// // //   `);
// // // });
// // require("dotenv").config();

// // const express = require("express");
// // const http = require("http");
// // const { Server } = require("socket.io");
// // const WebSocket = require("ws");
// // const path = require("path");
// // const fs = require("fs");
// // const { v4: uuidv4 } = require("uuid");
// // const mongoose = require("mongoose");

// // // ─── Config ───────────────────────────────────────────────────────────────────
// // const PORT = process.env.BYD_VOICE_PORT || 4030;
// // const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// // const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// // const ELEVENLABS_VOICE_ID =
// //   process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
// // const MONGODB_URI = process.env.MONGODB_URI;
// // const PREWARM_TTL_MS = 60_000;
// // const PREWARM_CONNECT_DELAY_MS = 400; // Debounce prewarm to avoid burning real connections on rapid connect/disconnect (StrictMode, fast refresh, flaky network)

// // const OPENAI_REALTIME_MODEL =
// //   process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
// // const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini"; // Used for end-of-call summary
// // const OPENAI_INPUT_SAMPLE_RATE = Number(
// //   process.env.OPENAI_INPUT_SAMPLE_RATE || 24000,
// // );

// // // FIX: threshold of 0.8 was too high for normal speaking volume to reliably
// // // trip server VAD, and a 2000ms silence requirement made the agent feel like
// // // it never stopped talking / never yielded the floor to the caller. These
// // // defaults match OpenAI's own recommended realtime conversational settings.
// // const OPENAI_VAD_THRESHOLD = Number(process.env.OPENAI_VAD_THRESHOLD || 0.5);
// // const OPENAI_VAD_PREFIX_PADDING_MS = Number(
// //   process.env.OPENAI_VAD_PREFIX_PADDING_MS || 300,
// // );
// // const OPENAI_VAD_SILENCE_DURATION_MS = Number(
// //   process.env.OPENAI_VAD_SILENCE_DURATION_MS || 500,
// // );

// // // ─── MongoDB Connection ───────────────────────────────────────────────────────
// // if (!MONGODB_URI) {
// //   console.warn("⚠️  MONGODB_URI not set — call logs will NOT be saved.");
// // } else {
// //   mongoose
// //     .connect(MONGODB_URI)
// //     .then(() => console.log("✅  MongoDB connected"))
// //     .catch((err) => console.error("❌  MongoDB error:", err.message));
// // }

// // // ─── Call Log Schema ──────────────────────────────────────────────────────────
// // const callLogSchema = new mongoose.Schema(
// //   {
// //     id: { type: String, required: true, unique: true },
// //     sessionId: { type: String, required: true },
// //     caller_name: { type: String, default: null },
// //     caller_phone: { type: String, default: null },
// //     caller_email: { type: String, default: null },
// //     vehicle_interest: { type: String, default: null },
// //     intent_category: {
// //       type: String,
// //       enum: [
// //         "vehicle_inquiry",
// //         "test_drive_booking",
// //         "pricing_inquiry",
// //         "trade_in_inquiry",
// //         "finance_inquiry",
// //         "service_booking",
// //         "general_enquiry",
// //         "staff_transfer",
// //         "comparison_request",
// //         "availability_check",
// //         "no_transcript_admin",
// //       ],
// //       required: true,
// //     },
// //     preferred_time: { type: String, default: null },
// //     staff_requested: { type: String, default: null },
// //     outcome: {
// //       type: String,
// //       enum: [
// //         "test_drive_booked",
// //         "callback_scheduled",
// //         "transferred",
// //         "info_provided",
// //         "brochure_sent",
// //         "message_taken",
// //         "escalated",
// //         "quote_provided",
// //       ],
// //       required: true,
// //     },
// //     ai_summary: { type: String, default: null },
// //     sentiment: {
// //       type: String,
// //       enum: ["positive", "neutral", "negative"],
// //       default: "neutral",
// //     },
// //     confidence_score: { type: Number, default: null },
// //     escalated: { type: Boolean, default: false },
// //     full_transcript: { type: Array, default: [] }, // Full transcript stored alongside the log
// //   },
// //   { timestamps: true },
// // );

// // const CallLog = mongoose.model("BYDCallLog", callLogSchema);

// // // ─── Recordings directory ─────────────────────────────────────────────────────
// // const RECORDINGS_DIR = path.join(__dirname, "recordings");
// // if (!fs.existsSync(RECORDINGS_DIR))
// //   fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

// // // ─── Express + Socket.IO ──────────────────────────────────────────────────────
// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, { cors: { origin: "*" } });

// // app.use(express.json());
// // app.use(express.static(path.join(__dirname, "public")));
// // app.use("/recordings", express.static(RECORDINGS_DIR));

// // // ─── Session State ────────────────────────────────────────────────────────────
// // const sessions = new Map();
// // const prewarmStates = new Map();
// // const prewarmTimers = new Map(); // Pending debounced prewarm timers per socket id

// // // ─── BYD Knowledge Base ───────────────────────────────────────────────────────
// // const BYD_KNOWLEDGE_SUMMARY = `
// // BYD VEHICLE LINEUP AT BYD FAIRFIELD:

// // ELECTRIC (BEV):
// // - ATTO 1: From $23,990 | Compact SUV | 220–310km range | Blade Battery | Great first EV
// // - ATTO 2: From $31,990 | Compact SUV | 345km range | 130kW | V2L capability
// // - ATTO 3: From $39,990 | Compact SUV | 420km range | 150kW | Most popular compact EV
// // - SEAL: From $52,990 | Sports sedan | 570km range (RWD) | Up to 390kW AWD | 3.8s 0-100
// // - SEALION 7: Mid-size SUV | 456km range | 230kW or 390kW AWD | Premium tech
// // - DOLPHIN: Compact hatchback | 427km range | City favourite | V2L | From ~$29,990

// // PLUG-IN HYBRID (PHEV):
// // - SEALION 5: PHEV SUV | DM-i tech | Long combined range | Affordable entry PHEV
// // - SEALION 6: From ~$44,990 | Mid-size PHEV SUV | DM-i | FWD | Ultra-low fuel use
// // - SEALION 8: 7-seat Super Hybrid SUV | DM-i/DM-p | Up to 359kW AWD | DiSus-C suspension
// // - SHARK 6: From $57,900 | PHEV dual-cab ute | 321–350kW | 800km combined ranggite | 3,500kg towing

// // KEY TECH:
// // - Blade Battery: BYD's safe LFP battery — passes nail penetration test, cobalt-free
// // - V2L: Power external devices from the car battery
// // - DM-i: Efficient hybrid system, electric-first driving
// // - DM-p: Performance hybrid with AWD
// // - DiSus-C: Adaptive damping suspension
// // - OTA: Over-the-air updates
// // - WARRANTY: 6 years vehicle / 8 years or 160,000km battery

// // DEALERSHIP:
// // - BYD Fairfield | 415 Heidelberg Road, Fairfield VIC 3078
// // - Phone: 03 4110 8888 | bydfairfield.com.au
// // - Test drives available 7 days
// // `.trim();

// // // ─── System Prompt ────────────────────────────────────────────────────────────
// // function getSystemPrompt(carContext) {
// //   const carContextBlock = carContext
// //     ? `
// // =============================================================
// // ACTIVE CAR CONTEXT — THIS IS THE PRIMARY VEHICLE OF INTEREST
// // =============================================================
// // The caller has opened this voice session from the ${carContext} page.
// // They are SPECIFICALLY interested in the ${carContext}.
// // - Lead ALL responses with ${carContext}-specific information first.
// // - Proactively mention ${carContext} specs, pricing, and features when relevant.
// // - Your opening greeting MUST reference the ${carContext} by name.
// // - If asked about other models, answer briefly then steer back to the ${carContext}.
// // =============================================================
// // `
// //     : "";

// //   return `
// // =============================================================
// // ABSOLUTE RULE — ENGLISH ONLY. THIS OVERRIDES EVERYTHING.
// // =============================================================
// // You MUST respond in English only. If the caller speaks another language,
// // say: "Sorry, I can only assist in English at the moment."
// // =============================================================

// // ### IDENTITY ###
// // You are the AI voice assistant for BYD Fairfield — an authorised BYD dealership at 415 Heidelberg Road, Fairfield VIC 3078.
// // You handle inbound enquiries: vehicle information, test drive bookings, pricing, comparisons, finance questions, and general dealership enquiries.
// // You sound like a friendly, knowledgeable Australian car sales consultant — warm, helpful, and enthusiastic about BYD.
// // ${carContextBlock}
// // ### AI DISCLOSURE ###
// // - Do NOT volunteer that you are AI.
// // - ONLY if explicitly asked "are you a robot / AI / real person?" — be honest:
// //   "Good question — I'm actually an AI assistant helping the BYD Fairfield team. I can book test drives, answer questions about any BYD model, and help you find the right car. How can I help?"
// // - Pivot straight back to helping them.

// // ### PERSONALITY ###
// // - Friendly, warm Australian manner
// // - Genuinely enthusiastic about BYD's technology (Blade Battery, V2L, range etc.)
// // - Never pushy — consultative and helpful
// // - Natural fillers: "absolutely", "great question", "no worries", "sure thing", "for sure"
// // - Match caller energy: relaxed with relaxed callers, efficient with busy ones

// // ### HOW YOU TALK ###
// // - SHORT responses — 1 to 2 sentences max
// // - Contractions: "what's", "we've", "I'll", "you're", "that's"
// // - ACKNOWLEDGE first, then respond
// // - ONE question at a time — never stack questions
// // - Silence/can't hear: "Still there?" or "Sorry, didn't catch that — could you say that again?"

// // ### BYD VEHICLE KNOWLEDGE ###
// // ${BYD_KNOWLEDGE_SUMMARY}

// // QUICK RECOMMENDATIONS:
// // - City / first EV → Atto 1, Atto 2, Dolphin
// // - Family compact EV → Atto 3
// // - Larger electric SUV → Sealion 7
// // - Performance EV → Seal Performance
// // - No range anxiety / long trips → Sealion 5, 6, 8 (PHEV) or Shark 6
// // - 7-seat family hybrid → Sealion 8
// // - Work ute / towing → Shark 6 Performance

// // =============================================================
// // CALL FLOW
// // =============================================================

// // STEP 01 — GREETING & INTENT
// // ${
// //   carContext
// //     ? `The caller is already on the ${carContext} page — greet them and confirm their interest in the ${carContext} immediately.

// // Start: "Thanks for calling BYD Fairfield! I can see you're checking out the ${carContext} — great choice. How can I help you with it today?"

// // Then: "And who am I speaking with?"`
// //     : `Greet first. Ask for name early. One question at a time.

// // Start: "Thanks for calling BYD Fairfield — you're through to the front desk. How can I help you today?"

// // Then: "Great — and who am I speaking with?"`
// // }

// // Use their name naturally once you have it.

// // STEP 02 — VALUE PROP (for serious buyers only)
// // Trigger for: test drive requests, purchase intent, serious comparisons.
// // Skip for: quick info requests, direction questions.

// // Script (adapt naturally):
// // "We've got the full BYD range in stock at Fairfield — from the Dolphin city car right through to the Shark 6 ute. Every car comes with a 6-year warranty and BYD's industry-leading Blade Battery. We can arrange a test drive any day of the week — what's caught your eye?"

// // STEP 03 — PROACTIVE CLOSE
// // Never end passively. Always offer a next step.

// // For TEST DRIVE:
// // "I can lock that in for you — we've got slots tomorrow at 11am and Saturday at 10am. Which works better?"

// // For PRICING:
// // "The [model] starts from [price] drive-away. Would you like me to get one of our consultants to put together a personalised quote?"

// // For COMPARISON:
// // "[Model A] is the choice if you want [benefit A], while [Model B] suits [benefit B] better. Would you like to compare them in person with a test drive of both?"

// // STEP 04 — COLLECT DETAILS (when booking)
// // One detail at a time, conversationally:
// // - Name (may already have)
// // - Which vehicle they want to test / enquire about
// // - Preferred date/time
// // - Contact: phone or email

// // =============================================================
// // ESCALATION
// // =============================================================
// // ALWAYS escalate (log escalated: true) for:
// // - Complaints or disputes
// // - Finance / legal questions beyond general info
// // - Abusive callers
// // - Complex trade-in negotiations

// // Script: "I want to make sure you get the best help with this — let me connect you with one of our consultants right now. Just one moment."

// // =============================================================
// // STEP 05 — SAVE CALL LOG (MANDATORY after every completed call)
// // =============================================================
// // After every call where intent was established, call save_call_log.

// // Required: caller_name, intent_category, outcome
// // Optional but important: caller_phone, caller_email, vehicle_interest, preferred_time, ai_summary, sentiment, confidence_score, escalated

// // =============================================================
// // HARD RULES
// // =============================================================
// // - ENGLISH ONLY
// // - ONE question at a time
// // - 1–2 sentences max per response
// // - NEVER assume caller's name
// // - ALWAYS call save_call_log after every completed call
// // - Never give legal or finance advice beyond general info
// // - Never make up pricing not in your knowledge base
// // `.trim();
// // }

// // // ─── Tool Definition ──────────────────────────────────────────────────────────
// // function getSaveCallLogTool() {
// //   return {
// //     type: "function",
// //     name: "save_call_log",
// //     description:
// //       "Saves a structured call log after every completed BYD Fairfield call. MUST be called once intent is established and the call reaches a natural conclusion.",
// //     parameters: {
// //       type: "object",
// //       properties: {
// //         caller_name: { type: "string", description: "Full name of the caller" },
// //         caller_phone: { type: "string", description: "Caller's phone number" },
// //         caller_email: { type: "string", description: "Caller's email" },
// //         vehicle_interest: {
// //           type: "string",
// //           description:
// //             "Vehicle model they enquired about e.g. 'BYD Seal Performance', 'Shark 6'",
// //         },
// //         intent_category: {
// //           type: "string",
// //           enum: [
// //             "vehicle_inquiry",
// //             "test_drive_booking",
// //             "pricing_inquiry",
// //             "trade_in_inquiry",
// //             "finance_inquiry",
// //             "service_booking",
// //             "general_enquiry",
// //             "staff_transfer",
// //             "comparison_request",
// //             "availability_check",
// //             "no_transcript_admin",
// //           ],
// //         },
// //         preferred_time: {
// //           type: "string",
// //           description: "Booked or preferred time slot",
// //         },
// //         staff_requested: {
// //           type: "string",
// //           description: "Staff member requested by name",
// //         },
// //         outcome: {
// //           type: "string",
// //           enum: [
// //             "test_drive_booked",
// //             "callback_scheduled",
// //             "transferred",
// //             "info_provided",
// //             "brochure_sent",
// //             "message_taken",
// //             "escalated",
// //             "quote_provided",
// //           ],
// //         },
// //         ai_summary: {
// //           type: "string",
// //           description: "1–2 sentence summary of the call",
// //         },
// //         sentiment: {
// //           type: "string",
// //           enum: ["positive", "neutral", "negative"],
// //         },
// //         confidence_score: { type: "number", description: "0.0 to 1.0" },
// //         escalated: { type: "boolean" },
// //       },
// //       required: ["caller_name", "intent_category", "outcome"],
// //     },
// //   };
// // }

// // // ─── Recording (WAV builder) ──────────────────────────────────────────────────
// // class ConversationRecorder {
// //   constructor(sessionId) {
// //     this.sessionId = sessionId;
// //     this.userChunks = [];
// //     this.agentChunks = [];
// //     this.startTime = Date.now();
// //     this.events = [];
// //   }

// //   addUserAudio(base64Pcm16) {
// //     const buf = Buffer.from(base64Pcm16, "base64");
// //     this.userChunks.push(buf);
// //     this.events.push({
// //       type: "user",
// //       time: Date.now() - this.startTime,
// //       bytes: buf.length,
// //     });
// //   }

// //   addAgentAudio(base64Pcm16) {
// //     const buf = Buffer.from(base64Pcm16, "base64");
// //     this.agentChunks.push(buf);
// //     this.events.push({
// //       type: "agent",
// //       time: Date.now() - this.startTime,
// //       bytes: buf.length,
// //     });
// //   }

// //   _resample(pcmBuffer, srcRate, dstRate) {
// //     if (srcRate === dstRate) return pcmBuffer;
// //     const srcSamples = pcmBuffer.length / 2;
// //     const ratio = srcRate / dstRate;
// //     const dstSamples = Math.floor(srcSamples / ratio);
// //     const out = Buffer.alloc(dstSamples * 2);
// //     for (let i = 0; i < dstSamples; i++) {
// //       const srcIdx = i * ratio;
// //       const lo = Math.floor(srcIdx);
// //       const hi = Math.min(lo + 1, srcSamples - 1);
// //       const frac = srcIdx - lo;
// //       const sLo = pcmBuffer.readInt16LE(lo * 2);
// //       const sHi = pcmBuffer.readInt16LE(hi * 2);
// //       const val = Math.round(sLo + (sHi - sLo) * frac);
// //       out.writeInt16LE(Math.max(-32768, Math.min(32767, val)), i * 2);
// //     }
// //     return out;
// //   }

// //   saveToFile() {
// //     const OUTPUT_RATE = 24000;
// //     const userPcm = Buffer.concat(this.userChunks);
// //     const agentPcm = this._resample(
// //       Buffer.concat(this.agentChunks),
// //       16000,
// //       OUTPUT_RATE,
// //     );
// //     const totalSamples = Math.max(userPcm.length / 2, agentPcm.length / 2);
// //     const mixed = Buffer.alloc(totalSamples * 2);

// //     for (let i = 0; i < totalSamples; i++) {
// //       let v = 0;
// //       if (i < userPcm.length / 2) v += userPcm.readInt16LE(i * 2);
// //       if (i < agentPcm.length / 2) v += agentPcm.readInt16LE(i * 2);
// //       mixed.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
// //     }

// //     const hdr = Buffer.alloc(44);
// //     const dataSize = mixed.length;
// //     hdr.write("RIFF", 0);
// //     hdr.writeUInt32LE(36 + dataSize, 4);
// //     hdr.write("WAVE", 8);
// //     hdr.write("fmt ", 12);
// //     hdr.writeUInt32LE(16, 16);
// //     hdr.writeUInt16LE(1, 20);
// //     hdr.writeUInt16LE(1, 22);
// //     hdr.writeUInt32LE(OUTPUT_RATE, 24);
// //     hdr.writeUInt32LE(OUTPUT_RATE * 2, 28);
// //     hdr.writeUInt16LE(2, 32);
// //     hdr.writeUInt16LE(16, 34);
// //     hdr.write("data", 36);
// //     hdr.writeUInt32LE(dataSize, 40);

// //     const wav = Buffer.concat([hdr, mixed]);
// //     const filename = `byd_call_${this.sessionId}_${Date.now()}.wav`;
// //     const filepath = path.join(RECORDINGS_DIR, filename);
// //     fs.writeFileSync(filepath, wav);
// //     console.log(
// //       `[Recording] Saved: ${filename} (${(wav.length / 1024 / 1024).toFixed(2)} MB)`,
// //     );
// //     return {
// //       filename,
// //       filepath,
// //       sizeMB: (wav.length / 1024 / 1024).toFixed(2),
// //     };
// //   }
// // }

// // // ─── Helpers ──────────────────────────────────────────────────────────────────
// // function sendWsJson(ws, payload) {
// //   if (!ws || ws.readyState !== WebSocket.OPEN) return false;
// //   ws.send(JSON.stringify(payload));
// //   return true;
// // }

// // function safeJsonParse(text) {
// //   try {
// //     return JSON.parse(text);
// //   } catch {
// //     return null;
// //   }
// // }

// // function toFunctionCallPayload(value) {
// //   if (!value || typeof value !== "object") return null;

// //   if (
// //     value.type === "function_call" &&
// //     typeof value.name === "string" &&
// //     typeof value.arguments === "string" &&
// //     typeof value.call_id === "string"
// //   ) {
// //     return {
// //       name: value.name,
// //       arguments: value.arguments,
// //       call_id: value.call_id,
// //     };
// //   }

// //   if (
// //     typeof value.name === "string" &&
// //     typeof value.arguments === "string" &&
// //     typeof value.call_id === "string"
// //   ) {
// //     return {
// //       name: value.name,
// //       arguments: value.arguments,
// //       call_id: value.call_id,
// //     };
// //   }

// //   return null;
// // }

// // function extractFunctionCallsFromResponse(response) {
// //   const calls = [];
// //   const output = response?.output;
// //   if (Array.isArray(output)) {
// //     for (const item of output) {
// //       const fc = toFunctionCallPayload(item);
// //       if (fc) calls.push(fc);
// //     }
// //   }
// //   return calls;
// // }

// // // ─── End-of-call summary generator ────────────────────────────────────────────
// // // Uses a plain OpenAI Chat Completions call (not the realtime socket) to turn
// // // the accumulated transcript into a structured summary once the call ends.
// // async function generateCallSummary(transcriptArray) {
// //   if (!transcriptArray || transcriptArray.length === 0) {
// //     return {
// //       summary: "No conversation took place.",
// //       sentiment: "neutral",
// //       intent_category: "no_transcript_admin",
// //       outcome: "message_taken",
// //       caller_name: null,
// //       vehicle_interest: null,
// //       confidence_score: 0,
// //     };
// //   }

// //   const conversationText = transcriptArray
// //     .map((t) => `${t.role === "user" ? "Caller" : "Agent"}: ${t.text}`)
// //     .join("\n");

// //   const prompt = `You are summarizing a phone call transcript from a BYD Fairfield dealership voice agent.

// // TRANSCRIPT:
// // ${conversationText}

// // Return ONLY a JSON object (no markdown, no preamble) with these fields:
// // {
// //   "summary": "2-3 sentence summary of what happened on the call",
// //   "sentiment": "positive" | "neutral" | "negative",
// //   "intent_category": one of ["vehicle_inquiry","test_drive_booking","pricing_inquiry","trade_in_inquiry","finance_inquiry","service_booking","general_enquiry","staff_transfer","comparison_request","availability_check","no_transcript_admin"],
// //   "outcome": one of ["test_drive_booked","callback_scheduled","transferred","info_provided","brochure_sent","message_taken","escalated","quote_provided"],
// //   "caller_name": "name if mentioned, else null",
// //   "vehicle_interest": "vehicle model if mentioned, else null",
// //   "confidence_score": number between 0 and 1
// // }`;

// //   try {
// //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${OPENAI_API_KEY}`,
// //       },
// //       body: JSON.stringify({
// //         model: OPENAI_SUMMARY_MODEL,
// //         messages: [{ role: "user", content: prompt }],
// //         response_format: { type: "json_object" },
// //         temperature: 0.3,
// //       }),
// //     });

// //     const data = await response.json();
// //     const raw = data?.choices?.[0]?.message?.content;
// //     if (!raw) throw new Error("No content returned from summary model");

// //     return JSON.parse(raw);
// //   } catch (err) {
// //     console.error("Summary generation failed:", err.message);
// //     return {
// //       summary: "Summary generation failed.",
// //       sentiment: "neutral",
// //       intent_category: "no_transcript_admin",
// //       outcome: "message_taken",
// //       caller_name: null,
// //       vehicle_interest: null,
// //       confidence_score: 0,
// //     };
// //   }
// // }

// // // ─── OpenAI Realtime Session ──────────────────────────────────────────────────
// // function createRealtimeSession(sessionId, onEvent, carContext) {
// //   const url = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
// //   const startMs = Date.now();

// //   return new Promise((resolve, reject) => {
// //     const ws = new WebSocket(url, {
// //       headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
// //     });

// //     ws.on("open", () => {
// //       console.log(
// //         `[${sessionId}] OpenAI Realtime connected (${Date.now() - startMs}ms)${carContext ? ` | Car context: ${carContext}` : ""}`,
// //       );

// //       sendWsJson(ws, {
// //         type: "session.update",
// //         session: {
// //           type: "realtime",
// //           model: OPENAI_REALTIME_MODEL,
// //           output_modalities: ["text"],
// //           audio: {
// //             input: {
// //               format: {
// //                 type: "audio/pcm",
// //                 rate: OPENAI_INPUT_SAMPLE_RATE,
// //               },
// //               turn_detection: {
// //                 type: "server_vad",
// //                 threshold: OPENAI_VAD_THRESHOLD,
// //                 prefix_padding_ms: OPENAI_VAD_PREFIX_PADDING_MS,
// //                 silence_duration_ms: OPENAI_VAD_SILENCE_DURATION_MS,
// //               },
// //             },
// //           },
// //           // Pass carContext into the system prompt
// //           instructions: getSystemPrompt(carContext || null),
// //           tools: [getSaveCallLogTool()],
// //           tool_choice: "auto",
// //         },
// //       });

// //       const session = {
// //         ws,
// //         carContext: carContext || null,
// //         elevenLabsWs: null,
// //         elevenLabsReady: false,
// //         textBuffer: [],
// //         isResponseActive: false,
// //         onEvent,
// //         startMs,
// //         openAiConnectedMs: Date.now(),
// //         elevenLabsConnectedMs: null,
// //         greetingTriggeredMs: null,
// //         firstResponseCreatedMs: null,
// //         firstAudioDeltaLogged: false,
// //         processedCallIds: new Set(),
// //         recorder: new ConversationRecorder(sessionId),
// //         callLogs: [],
// //         elevenLabsOpening: false,
// //         transcript: [], // full conversation transcript { role, text, ts }
// //         currentAssistantText: "", // accumulates streaming text deltas
// //       };

// //       sessions.set(sessionId, session);
// //       openElevenLabsStream(sessionId);
// //       resolve();
// //     });

// //     ws.on("message", async (data) => {
// //       try {
// //         const event = JSON.parse(data.toString());
// //         await handleRealtimeEvent(sessionId, event);
// //       } catch (err) {
// //         console.error(`[${sessionId}] Parse error:`, err.message);
// //       }
// //     });

// //     ws.on("error", (err) => {
// //       console.error(`[${sessionId}] OpenAI WS error:`, err.message);
// //       onEvent({ type: "error", error: { message: err.message } });
// //       reject(err);
// //     });

// //     ws.on("close", (code) => {
// //       console.log(`[${sessionId}] OpenAI WS closed: ${code}`);
// //       closeElevenLabsWs(sessionId);
// //       sessions.delete(sessionId);
// //       onEvent({ type: "session-closed" });
// //     });
// //   });
// // }

// // // ─── Audio helpers ────────────────────────────────────────────────────────────
// // function sendAudio(sessionId, base64Audio) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;
// //   session.recorder.addUserAudio(base64Audio);
// //   sendWsJson(session.ws, {
// //     type: "input_audio_buffer.append",
// //     audio: base64Audio,
// //   });
// // }

// // // ─── Trigger greeting — car-context-aware ─────────────────────────────────────
// // function triggerGreeting(sessionId) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;
// //   session.greetingTriggeredMs = Date.now();
// //   console.log(
// //     `[${sessionId}] Greeting triggered (${session.greetingTriggeredMs - session.startMs}ms)`,
// //   );

// //   if (session.carContext) {
// //     const primeMessage =
// //       `The caller has just opened the voice assistant from the ${session.carContext} page. ` +
// //       `They are interested in the ${session.carContext}. ` +
// //       `Greet them warmly and reference the ${session.carContext} by name in your opening line.`;

// //     sendWsJson(session.ws, {
// //       type: "conversation.item.create",
// //       item: {
// //         type: "message",
// //         role: "user",
// //         content: [{ type: "input_text", text: primeMessage }],
// //       },
// //     });
// //   }

// //   sendWsJson(session.ws, { type: "response.create" });
// // }

// // // ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

// // function _openNewElevenLabsStream(sessionId) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;

// //   if (session.elevenLabsOpening) {
// //     console.log(`[${sessionId}] ElevenLabs open already in-flight, skipping`);
// //     return;
// //   }
// //   session.elevenLabsOpening = true;

// //   const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream-input?model_id=eleven_multilingual_v2&output_format=pcm_16000`;
// //   const elWs = new WebSocket(wsUrl);

// //   elWs.on("open", () => {
// //     if (!sessions.has(sessionId) || session.elevenLabsWs !== elWs) {
// //       elWs.close();
// //       return;
// //     }

// //     console.log(`[${sessionId}] ElevenLabs connected`);
// //     session.elevenLabsConnectedMs = Date.now();
// //     session.elevenLabsOpening = false;

// //     elWs.send(
// //       JSON.stringify({
// //         text: " ",
// //         voice_settings: {
// //           stability: 0.5,
// //           similarity_boost: 0.8,
// //           style: 0.3,
// //           use_speaker_boost: true,
// //         },
// //         xi_api_key: ELEVENLABS_API_KEY,
// //       }),
// //     );

// //     session.elevenLabsReady = true;
// //     for (const text of session.textBuffer) {
// //       if (elWs.readyState === WebSocket.OPEN) {
// //         elWs.send(JSON.stringify({ text, try_trigger_generation: true }));
// //       }
// //     }
// //     session.textBuffer = [];
// //   });

// //   elWs.on("message", (data) => {
// //     try {
// //       const msg = JSON.parse(data.toString());
// //       if (msg.audio) {
// //         session.recorder.addAgentAudio(msg.audio);
// //         session.onEvent({ type: "audio-delta", delta: msg.audio });
// //       }
// //     } catch {}
// //   });

// //   elWs.on("error", (err) => {
// //     console.warn(`[${sessionId}] ElevenLabs error: ${err.message}`);
// //     session.elevenLabsOpening = false;
// //   });

// //   elWs.on("close", () => {
// //     if (session.elevenLabsWs === elWs) {
// //       session.elevenLabsReady = false;
// //       session.elevenLabsOpening = false;
// //     }
// //   });

// //   session.elevenLabsWs = elWs;
// // }

// // function openElevenLabsStream(sessionId, force = false) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;

// //   const oldWs = session.elevenLabsWs;

// //   if (!force) {
// //     if (
// //       oldWs &&
// //       (oldWs.readyState === WebSocket.OPEN ||
// //         oldWs.readyState === WebSocket.CONNECTING)
// //     ) {
// //       return;
// //     }
// //     _openNewElevenLabsStream(sessionId);
// //     return;
// //   }

// //   session.textBuffer = [];
// //   session.elevenLabsReady = false;

// //   if (
// //     !oldWs ||
// //     oldWs.readyState === WebSocket.CLOSED ||
// //     oldWs.readyState === WebSocket.CLOSING
// //   ) {
// //     session.elevenLabsWs = null;
// //     session.elevenLabsOpening = false;
// //     _openNewElevenLabsStream(sessionId);
// //     return;
// //   }

// //   if (oldWs.readyState === WebSocket.CONNECTING) {
// //     session.elevenLabsWs = null;
// //     session.elevenLabsOpening = false;
// //     try {
// //       oldWs.terminate();
// //     } catch (_) {}
// //     _openNewElevenLabsStream(sessionId);
// //     return;
// //   }

// //   session.elevenLabsWs = null;
// //   session.elevenLabsOpening = false;

// //   try {
// //     oldWs.send(JSON.stringify({ text: "" }));
// //   } catch (_) {}

// //   oldWs.once("close", () => {
// //     if (!sessions.has(sessionId)) return;
// //     const s = sessions.get(sessionId);
// //     if (s && !s.elevenLabsWs && !s.elevenLabsOpening) {
// //       _openNewElevenLabsStream(sessionId);
// //     }
// //   });

// //   setTimeout(() => {
// //     if (!sessions.has(sessionId)) return;
// //     const s = sessions.get(sessionId);
// //     if (s && !s.elevenLabsWs && !s.elevenLabsOpening) {
// //       console.warn(`[${sessionId}] ElevenLabs close timeout — forcing open`);
// //       _openNewElevenLabsStream(sessionId);
// //     }
// //   }, 800);

// //   try {
// //     oldWs.close();
// //   } catch (_) {}
// // }

// // function sendTextToElevenLabs(sessionId, text) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;
// //   if (
// //     session.elevenLabsWs?.readyState === WebSocket.OPEN &&
// //     session.elevenLabsReady
// //   ) {
// //     session.elevenLabsWs.send(
// //       JSON.stringify({ text, try_trigger_generation: true }),
// //     );
// //   } else {
// //     session.textBuffer.push(text);
// //   }
// // }

// // function flushElevenLabsStream(sessionId) {
// //   const session = sessions.get(sessionId);
// //   if (session?.elevenLabsWs?.readyState === WebSocket.OPEN) {
// //     session.elevenLabsWs.send(JSON.stringify({ text: "" }));
// //   }
// // }

// // function closeElevenLabsWs(sessionId) {
// //   const session = sessions.get(sessionId);
// //   if (session?.elevenLabsWs) {
// //     try {
// //       if (session.elevenLabsWs.readyState === WebSocket.CONNECTING)
// //         session.elevenLabsWs.terminate();
// //       else if (session.elevenLabsWs.readyState === WebSocket.OPEN)
// //         session.elevenLabsWs.close();
// //     } catch {}
// //     session.elevenLabsWs = null;
// //     session.elevenLabsReady = false;
// //     session.elevenLabsOpening = false;
// //     session.textBuffer = [];
// //   }
// // }

// // // ─── Function call handler ────────────────────────────────────────────────────
// // async function handleFunctionCall(sessionId, eventOrItem) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;

// //   const call = toFunctionCallPayload(eventOrItem);
// //   if (!call || call.name !== "save_call_log") return;

// //   const callId = typeof call.call_id === "string" ? call.call_id : null;
// //   if (callId && session.processedCallIds.has(callId)) return;
// //   if (callId) session.processedCallIds.add(callId);

// //   try {
// //     const args = JSON.parse(call.arguments);
// //     console.log(
// //       `[${sessionId}] Saving call log | name: ${args.caller_name} | intent: ${args.intent_category} | outcome: ${args.outcome}`,
// //     );

// //     const logId = uuidv4();
// //     const callLog = new CallLog({
// //       id: logId,
// //       sessionId,
// //       caller_name: args.caller_name || null,
// //       caller_phone: args.caller_phone || null,
// //       caller_email: args.caller_email || null,
// //       // Auto-populate vehicle_interest from carContext if AI didn't extract one
// //       vehicle_interest: args.vehicle_interest || session.carContext || null,
// //       intent_category: args.intent_category,
// //       preferred_time: args.preferred_time || null,
// //       staff_requested: args.staff_requested || null,
// //       outcome: args.outcome,
// //       ai_summary: args.ai_summary || null,
// //       sentiment: args.sentiment || "neutral",
// //       confidence_score: args.confidence_score || null,
// //       escalated: args.escalated || false,
// //       // NOTE: this is only a SNAPSHOT of the transcript at the moment the
// //       // tool fired — the call usually continues afterwards. closeSession()
// //       // below re-syncs this record with the complete transcript once the
// //       // call actually ends, so this initial value is not the final one.
// //       full_transcript: session.transcript || [],
// //     });

// //     await callLog.save();
// //     session.callLogs.push({ id: logId, ...args });
// //     console.log(`[${sessionId}] Call log saved to MongoDB: ${logId}`);

// //     sendWsJson(session.ws, {
// //       type: "conversation.item.create",
// //       item: {
// //         type: "function_call_output",
// //         call_id: call.call_id,
// //         output: JSON.stringify({
// //           success: true,
// //           message: "Call log saved successfully.",
// //           log_id: logId,
// //           outcome: args.outcome,
// //         }),
// //       },
// //     });
// //     sendWsJson(session.ws, { type: "response.create" });
// //     session.onEvent({ type: "call-logged", data: args });
// //   } catch (err) {
// //     if (callId) session.processedCallIds.delete(callId);
// //     console.error(`[${sessionId}] Call log save failed:`, err.message);
// //   }
// // }

// // // ─── OpenAI Event handler ─────────────────────────────────────────────────────
// // async function handleRealtimeEvent(sessionId, event) {
// //   const session = sessions.get(sessionId);
// //   if (!session) return;

// //   switch (event.type) {
// //     case "session.created":
// //     case "session.updated":
// //       break;

// //     case "response.created":
// //       session.isResponseActive = true;
// //       session.currentAssistantText = ""; // reset accumulator for new turn
// //       if (!session.firstResponseCreatedMs) {
// //         session.firstResponseCreatedMs = Date.now();
// //       }
// //       if (
// //         !session.elevenLabsWs ||
// //         (session.elevenLabsWs.readyState !== WebSocket.OPEN &&
// //           session.elevenLabsWs.readyState !== WebSocket.CONNECTING)
// //       ) {
// //         openElevenLabsStream(sessionId);
// //       }
// //       break;

// //     case "response.output_text.delta":
// //     case "response.text.delta":
// //       sendTextToElevenLabs(sessionId, event.delta);
// //       session.currentAssistantText += event.delta || "";
// //       session.onEvent({ type: "transcript-delta", delta: event.delta });
// //       break;

// //     // Audio transcript deltas — companion text when modalities includes audio
// //     case "response.audio_transcript.delta":
// //       sendTextToElevenLabs(sessionId, event.delta);
// //       session.currentAssistantText += event.delta || "";
// //       session.onEvent({ type: "transcript-delta", delta: event.delta });
// //       break;

// //     // Native OpenAI audio — fallback if ElevenLabs is not connected
// //     case "response.audio.delta":
// //       if (event.delta) {
// //         if (
// //           !session.elevenLabsWs ||
// //           session.elevenLabsWs.readyState !== WebSocket.OPEN
// //         ) {
// //           session.recorder.addAgentAudio(event.delta);
// //           session.onEvent({ type: "audio-delta", delta: event.delta });
// //         }
// //       }
// //       break;

// //     case "response.audio.done":
// //       break;

// //     case "response.output_text.done":
// //     case "response.text.done": {
// //       flushElevenLabsStream(sessionId);
// //       // push finished assistant turn into transcript
// //       const assistantText = (
// //         event.text ||
// //         session.currentAssistantText ||
// //         ""
// //       ).trim();
// //       if (assistantText) {
// //         session.transcript.push({
// //           role: "assistant",
// //           text: assistantText,
// //           ts: Date.now(),
// //         });
// //       }
// //       session.currentAssistantText = "";
// //       session.onEvent({ type: "transcript-done", transcript: event.text });
// //       break;
// //     }

// //     case "response.audio_transcript.done": {
// //       flushElevenLabsStream(sessionId);
// //       const aText = (
// //         event.transcript ||
// //         session.currentAssistantText ||
// //         ""
// //       ).trim();
// //       if (aText) {
// //         session.transcript.push({
// //           role: "assistant",
// //           text: aText,
// //           ts: Date.now(),
// //         });
// //       }
// //       session.currentAssistantText = "";
// //       session.onEvent({
// //         type: "transcript-done",
// //         transcript: event.transcript,
// //       });
// //       break;
// //     }

// //     case "response.done": {
// //       session.isResponseActive = false;
// //       const calls = extractFunctionCallsFromResponse(event.response);
// //       for (const fc of calls) await handleFunctionCall(sessionId, fc);
// //       break;
// //     }

// //     case "response.output_item.done":
// //       if (event.item) {
// //         const fc = toFunctionCallPayload(event.item);
// //         if (fc) await handleFunctionCall(sessionId, fc);
// //       }
// //       break;

// //     case "response.function_call_arguments.done":
// //       await handleFunctionCall(sessionId, event);
// //       break;

// //     case "input_audio_buffer.speech_started":
// //       console.log(`[${sessionId}] User speech started (VAD)`);

// //       if (session.isResponseActive) {
// //         console.log(`[${sessionId}] User interrupted — stopping AI voice`);
// //         sendWsJson(session.ws, { type: "response.cancel" });
// //         session.isResponseActive = false;
// //         openElevenLabsStream(sessionId, true); // Force restart ElevenLabs stream to cut off audio generation instantly
// //       }

// //       // FIX: previously only the backend generation was cancelled, but any
// //       // audio chunks already sent to the browser kept playing there
// //       // regardless — which is why the agent appeared to keep talking over
// //       // the caller instead of yielding the floor. Tell the client to hard-stop
// //       // and flush its playback queue the instant VAD detects the user talking.
// //       session.onEvent({ type: "clear-audio" });

// //       session.onEvent({ type: "speech-started" });
// //       break;

// //     case "input_audio_buffer.speech_stopped":
// //       console.log(`[${sessionId}] User speech stopped (VAD)`);
// //       break;

// //     case "input_audio_buffer.committed":
// //       console.log(`[${sessionId}] Audio buffer committed — AI generating`);
// //       break;

// //     case "conversation.item.input_audio_transcription.completed":
// //       // push user turn into transcript
// //       if (event.transcript && event.transcript.trim()) {
// //         session.transcript.push({
// //           role: "user",
// //           text: event.transcript.trim(),
// //           ts: Date.now(),
// //         });
// //       }
// //       session.onEvent({
// //         type: "user-transcript",
// //         transcript: event.transcript,
// //       });
// //       break;

// //     case "error":
// //       if (event.error && event.error.code === "response_cancel_not_active") {
// //         // Harmless race condition when VAD triggers a cancel right as a response finishes
// //         console.log(`[${sessionId}] Ignored response_cancel_not_active error`);
// //         break;
// //       }
// //       console.error(
// //         `[${sessionId}] OpenAI error:`,
// //         JSON.stringify(event.error),
// //       );
// //       session.onEvent({ type: "error", error: event.error });
// //       break;

// //     default:
// //       break;
// //   }
// // }

// // // ─── Close session ────────────────────────────────────────────────────────────
// // async function closeSession(sessionId) {
// //   const session = sessions.get(sessionId);
// //   if (session) {
// //     // Skip the save/summary pipeline entirely for sessions that never had a
// //     // real conversation (e.g. idle prewarm sessions closed/replaced before
// //     // the caller said anything). Previously this always ran, which meant
// //     // every page load / reconnect / car-context switch wrote a junk "No
// //     // conversation took place" row to Mongo and burned an extra OpenAI
// //     // chat-completions call for nothing.
// //     const hadConversation = session.transcript && session.transcript.length > 0;

// //     if (hadConversation) {
// //       try {
// //         const result = session.recorder.saveToFile();
// //         session.onEvent({
// //           type: "recording-saved",
// //           data: {
// //             filename: result.filename,
// //             url: `/recordings/${result.filename}`,
// //           },
// //         });
// //       } catch (err) {
// //         console.error(`[${sessionId}] Recording save failed:`, err.message);
// //       }

// //       try {
// //         // This always runs over session.transcript, which by this point
// //         // contains EVERY turn of the call (not a mid-call snapshot).
// //         const summaryData = await generateCallSummary(session.transcript);

// //         session.onEvent({
// //           type: "call-summary",
// //           data: {
// //             ...summaryData,
// //             fullTranscript: session.transcript,
// //           },
// //         });

// //         if (session.callLogs.length > 0) {
// //           // FIX: save_call_log fired mid-call, so the row it created only
// //           // has a SNAPSHOT of the transcript up to that point — anything
// //           // said afterwards (goodbyes, follow-up questions, etc.) never made
// //           // it into the database. Sync that row with the complete, final
// //           // transcript and a summary/sentiment computed over the whole call.
// //           const updated = await CallLog.findOneAndUpdate(
// //             { sessionId },
// //             {
// //               $set: {
// //                 full_transcript: session.transcript || [],
// //                 ai_summary: summaryData.summary || undefined,
// //                 sentiment: summaryData.sentiment || undefined,
// //               },
// //             },
// //             { sort: { createdAt: -1 }, new: true },
// //           );
// //           console.log(
// //             `[${sessionId}] Synced existing call log with full final transcript` +
// //               (updated ? ` (id: ${updated.id})` : " (no matching row found)"),
// //           );
// //         } else {
// //           // No tool call happened this session — create the log now from the
// //           // end-of-call summary, with the complete transcript attached.
// //           const logId = uuidv4();
// //           const callLog = new CallLog({
// //             id: logId,
// //             sessionId,
// //             caller_name: summaryData.caller_name || null,
// //             vehicle_interest:
// //               summaryData.vehicle_interest || session.carContext || null,
// //             intent_category:
// //               summaryData.intent_category || "no_transcript_admin",
// //             outcome: summaryData.outcome || "message_taken",
// //             ai_summary: summaryData.summary || null,
// //             sentiment: summaryData.sentiment || "neutral",
// //             confidence_score: summaryData.confidence_score ?? null,
// //             escalated: false,
// //             full_transcript: session.transcript || [],
// //           });
// //           await callLog.save();
// //           console.log(`[${sessionId}] End-of-call summary saved: ${logId}`);
// //         }
// //       } catch (err) {
// //         console.error(
// //           `[${sessionId}] Summary generation/save failed:`,
// //           err.message,
// //         );
// //       }
// //     } else {
// //       console.log(
// //         `[${sessionId}] Closing empty session — skipping recording/summary/save`,
// //       );
// //     }

// //     closeElevenLabsWs(sessionId);
// //     try {
// //       session.ws.close();
// //     } catch {}
// //     sessions.delete(sessionId);
// //     console.log(`[${sessionId}] Session closed`);
// //   }
// // }

// // // ─── Prewarm ──────────────────────────────────────────────────────────────────
// // function clearPrewarmState(sessionId) {
// //   const state = prewarmStates.get(sessionId);
// //   if (!state) return;
// //   clearTimeout(state.ttlTimer);
// //   prewarmStates.delete(sessionId);
// // }

// // function startPrewarm(sessionId, eventForwarder) {
// //   if (prewarmStates.has(sessionId)) return prewarmStates.get(sessionId).promise;

// //   const state = { promise: null, ready: false, failed: false, ttlTimer: null };

// //   state.promise = createRealtimeSession(sessionId, eventForwarder, null)
// //     .then(() => {
// //       state.ready = true;
// //       console.log(`[${sessionId}] Prewarm ready`);
// //     })
// //     .catch((err) => {
// //       state.failed = true;
// //       console.warn(`[${sessionId}] Prewarm failed: ${err.message}`);
// //       throw err;
// //     });

// //   state.ttlTimer = setTimeout(() => {
// //     if (!prewarmStates.has(sessionId)) return;
// //     console.log(`[${sessionId}] Prewarm TTL expired — closing idle session`);
// //     clearPrewarmState(sessionId);
// //     closeSession(sessionId);
// //   }, PREWARM_TTL_MS);

// //   prewarmStates.set(sessionId, state);
// //   return state.promise;
// // }

// // // ─── Event Forwarder ──────────────────────────────────────────────────────────
// // function buildEventForwarder(socket) {
// //   return (event) => {
// //     switch (event.type) {
// //       case "audio-delta":
// //         socket.emit("audio-delta", { delta: event.delta });
// //         break;
// //       // NEW: forwards the barge-in signal so the client can hard-stop/flush
// //       // its own playback queue instead of letting buffered audio keep going.
// //       case "clear-audio":
// //         socket.emit("audio-clear", {});
// //         break;
// //       case "transcript-delta":
// //         socket.emit("transcript-delta", { delta: event.delta });
// //         break;
// //       case "transcript-done":
// //         socket.emit("transcript-done", { transcript: event.transcript });
// //         break;
// //       case "user-transcript":
// //         socket.emit("user-transcript", { transcript: event.transcript });
// //         break;
// //       case "speech-started":
// //         socket.emit("speech-started", {});
// //         break;
// //       case "call-logged":
// //         socket.emit("call-logged", event.data);
// //         break;
// //       case "call-summary":
// //         socket.emit("call-summary", event.data);
// //         break;
// //       case "recording-saved":
// //         socket.emit("recording-saved", event.data);
// //         break;
// //       case "error":
// //         socket.emit("realtime-error", { error: event.error });
// //         break;
// //       case "session-closed":
// //         socket.emit("session-closed", {});
// //         break;
// //     }
// //   };
// // }

// // // ─── Socket.IO ────────────────────────────────────────────────────────────────
// // io.on("connection", (socket) => {
// //   console.log(`Client connected: ${socket.id}`);
// //   const forwarder = buildEventForwarder(socket);

// //   // Debounce prewarm instead of firing it instantly on every connect. This
// //   // avoids opening a real OpenAI Realtime WS + ElevenLabs WS for transient
// //   // connections (React StrictMode double-mount, fast refresh, brief network
// //   // blips) that disconnect again within a few hundred ms.
// //   const prewarmTimer = setTimeout(() => {
// //     prewarmTimers.delete(socket.id);
// //     startPrewarm(socket.id, forwarder).catch(() => {});
// //   }, PREWARM_CONNECT_DELAY_MS);
// //   prewarmTimers.set(socket.id, prewarmTimer);

// //   socket.on("start-session", async (data) => {
// //     const sessionId = socket.id;
// //     const carContext = data?.carContext || null;
// //     console.log(
// //       `[${sessionId}] Starting voice session${carContext ? ` | Car: ${carContext}` : ""}`,
// //     );

// //     // If prewarm hasn't fired yet, cancel it — we're about to create the
// //     // session ourselves (either reusing logic below or with carContext).
// //     const pendingPrewarm = prewarmTimers.get(sessionId);
// //     if (pendingPrewarm) {
// //       clearTimeout(pendingPrewarm);
// //       prewarmTimers.delete(sessionId);
// //     }

// //     try {
// //       if (carContext) {
// //         clearPrewarmState(sessionId);
// //         await closeSession(sessionId);

// //         await createRealtimeSession(sessionId, forwarder, carContext);
// //         socket.emit("session-started", { sessionId });
// //         triggerGreeting(sessionId);
// //         return;
// //       }

// //       let state = prewarmStates.get(sessionId);
// //       if (!state) {
// //         await startPrewarm(sessionId, forwarder);
// //         state = prewarmStates.get(sessionId);
// //       }
// //       if (state) {
// //         try {
// //           await state.promise;
// //           if (state.ready) {
// //             clearPrewarmState(sessionId);
// //             socket.emit("session-started", { sessionId });
// //             triggerGreeting(sessionId);
// //             return;
// //           }
// //         } catch {}
// //         clearPrewarmState(sessionId);
// //       }

// //       await createRealtimeSession(sessionId, forwarder, null);
// //       socket.emit("session-started", { sessionId });
// //       triggerGreeting(sessionId);
// //     } catch (err) {
// //       console.error(`[${sessionId}] Session start failed:`, err.message);
// //       socket.emit("realtime-error", {
// //         error: { message: "Failed to connect to AI service" },
// //       });
// //     }
// //   });

// //   socket.on("audio-chunk", (data) => {
// //     if (data?.audio) sendAudio(socket.id, data.audio);
// //   });

// //   // client can request the live transcript at any point during the call
// //   socket.on("get-transcript", () => {
// //     const session = sessions.get(socket.id);
// //     socket.emit("transcript-state", {
// //       transcript: session?.transcript || [],
// //     });
// //   });

// //   socket.on("end-session", async () => {
// //     console.log(`[${socket.id}] End session requested`);
// //     clearPrewarmState(socket.id);
// //     await closeSession(socket.id); // summary is generated before this resolves (if there was a conversation)
// //     socket.emit("session-closed", {});
// //   });

// //   socket.on("disconnect", async () => {
// //     console.log(`Client disconnected: ${socket.id}`);

// //     // Cancel any pending debounced prewarm so a fast connect/disconnect
// //     // cycle never opens a real connection at all.
// //     const pendingPrewarm = prewarmTimers.get(socket.id);
// //     if (pendingPrewarm) {
// //       clearTimeout(pendingPrewarm);
// //       prewarmTimers.delete(socket.id);
// //     }

// //     clearPrewarmState(socket.id);
// //     await closeSession(socket.id);
// //   });
// // });

// // // ─── REST Endpoints ───────────────────────────────────────────────────────────
// // app.get("/api/call-logs", async (req, res) => {
// //   try {
// //     const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
// //     res.json(logs);
// //   } catch (err) {
// //     res.status(500).json({ error: "Failed to fetch call logs" });
// //   }
// // });

// // app.get("/api/call-logs/intent/:intent", async (req, res) => {
// //   try {
// //     const logs = await CallLog.find({ intent_category: req.params.intent })
// //       .sort({ createdAt: -1 })
// //       .lean();
// //     res.json(logs);
// //   } catch (err) {
// //     res.status(500).json({ error: "Failed to fetch call logs" });
// //   }
// // });

// // app.get("/api/recordings", (req, res) => {
// //   const files = fs
// //     .readdirSync(RECORDINGS_DIR)
// //     .filter((f) => f.endsWith(".wav"));
// //   res.json(
// //     files.map((f) => ({
// //       filename: f,
// //       url: `/recordings/${f}`,
// //       size:
// //         (fs.statSync(path.join(RECORDINGS_DIR, f)).size / 1024 / 1024).toFixed(
// //           2,
// //         ) + " MB",
// //     })),
// //   );
// // });

// // // standalone summary endpoint — pass { transcript: [{role, text}, ...] }
// // app.post("/api/summary", async (req, res) => {
// //   try {
// //     const { transcript } = req.body;
// //     if (!Array.isArray(transcript)) {
// //       return res.status(400).json({ error: "transcript must be an array" });
// //     }
// //     const summary = await generateCallSummary(transcript);
// //     res.json(summary);
// //   } catch (err) {
// //     console.error("Summary endpoint failed:", err.message);
// //     res.status(500).json({ error: "Failed to generate summary" });
// //   }
// // });

// // app.get("/api/health", (req, res) =>
// //   res.json({ status: "ok", sessions: sessions.size }),
// // );

// // // ─── Start ────────────────────────────────────────────────────────────────────
// // server.listen(PORT, () => {
// //   console.log(`
// // ╔══════════════════════════════════════════════════════════════╗
// // ║   BYD Fairfield — AI Voice Agent (OmniSuiteAI)               ║
// // ║   Running on http://localhost:${PORT}                         ║
// // ║                                                              ║
// // ║   Model:          ${OPENAI_REALTIME_MODEL}                   ║
// // ║   Summary Model:  ${OPENAI_SUMMARY_MODEL}                    ║
// // ║   OpenAI API Key: ${OPENAI_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// // ║   ElevenLabs Key: ${ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// // ║   Voice ID:       ${ELEVENLABS_VOICE_ID}                     ║
// // ║   MongoDB:        ${MONGODB_URI ? "✓ Set" : "✗ Missing"}                             ║
// // ╚══════════════════════════════════════════════════════════════╝
// //   `);
// // });
// require("dotenv").config();
// const PDFDocument = require("pdfkit"); // NEW — for the session summary PDF endpoint

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const WebSocket = require("ws");
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");
// const { v4: uuidv4 } = require("uuid");
// const mongoose = require("mongoose");

// // ─── Config ───────────────────────────────────────────────────────────────────
// const PORT = process.env.PC_VOICE_PORT || 4051;
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// const ELEVENLABS_VOICE_ID =
//   process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
// const MONGODB_URI = process.env.MONGODB_URI;
// const PREWARM_TTL_MS = 60_000;
// const PREWARM_CONNECT_DELAY_MS = 400;

// const OPENAI_REALTIME_MODEL =
//   process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
// const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini";
// const OPENAI_INPUT_SAMPLE_RATE = Number(
//   process.env.OPENAI_INPUT_SAMPLE_RATE || 24000,
// );

// const OPENAI_VAD_THRESHOLD = Number(process.env.OPENAI_VAD_THRESHOLD || 0.5);
// const OPENAI_VAD_PREFIX_PADDING_MS = Number(
//   process.env.OPENAI_VAD_PREFIX_PADDING_MS || 300,
// );
// const OPENAI_VAD_SILENCE_DURATION_MS = Number(
//   process.env.OPENAI_VAD_SILENCE_DURATION_MS || 500,
// );

// // KNOWN GAP (flagged, not solved by this file — see GAP_ANALYSIS.md):
// // This server drives audio over a browser WebSocket (socket.io) via OpenAI
// // Realtime + ElevenLabs. That is correct for the Simulation/Vetting sandbox
// // (text + voice preview in-browser, per the requirements doc). It is NOT a
// // PSTN/outbound dialer. A real "call James Nguyen's mobile" pilot needs a
// // telephony leg (Twilio Programmable Voice / SIP trunk, or a platform like
// // Retell/Vapi that already bridges realtime LLM audio to PSTN + warm SIP
// // transfer). Wire that in as a separate `telephony.js` adapter that feeds
// // the same createRealtimeSession()/handleRealtimeEvent() pipeline.

// // ─── MongoDB Connection ───────────────────────────────────────────────────────
// if (!MONGODB_URI) {
//   console.warn("⚠️  MONGODB_URI not set — call logs will NOT be saved.");
// } else {
//   mongoose
//     .connect(MONGODB_URI)
//     .then(() => console.log("✅  MongoDB connected"))
//     .catch((err) => console.error("❌  MongoDB error:", err.message));
// }

// // ─── Call Log Schema ──────────────────────────────────────────────────────────
// // Extended per requirements: "LLM post-processing extracts: outcome
// // category, booking details (date/time/vehicle), upgrade interest level,
// // key objections/notes, sentiment, recommended next action."
// const callLogSchema = new mongoose.Schema(
//   {
//     id: { type: String, required: true, unique: true },
//     sessionId: { type: String, required: true },
//     isSimulation: { type: Boolean, default: true }, // simulation vs live pilot call
//     customerId: { type: String, default: null }, // links back to SimulationCustomer.id
//     brand: {
//       type: String,
//       enum: ["Toyota", "Mercedes-Benz", "Isuzu", null],
//       default: null,
//     },
//     caller_name: { type: String, default: null },
//     caller_phone: { type: String, default: null },
//     caller_email: { type: String, default: null },
//     vehicle_interest: { type: String, default: null },

//     scenario: {
//       type: String,
//       enum: [
//         "service_due",
//         "upgrade_opportunity",
//         "finance_renewal",
//         "objection_handling",
//         "callback_follow_up",
//         null,
//       ],
//       default: null,
//     },

//     intent_category: {
//       type: String,
//       enum: [
//         "service_booking",
//         "upgrade_qualification",
//         "finance_renewal_inquiry",
//         "objection_handling",
//         "faq",
//         "staff_transfer",
//         "callback_follow_up",
//         "no_transcript_admin",
//       ],
//       required: true,
//     },

//     outcome: {
//       type: String,
//       enum: [
//         "service_booked",
//         "callback_scheduled",
//         "transferred_to_human",
//         "info_provided",
//         "test_drive_booked",
//         "declined",
//         "message_taken",
//         "escalated",
//         "no_answer",
//       ],
//       required: true,
//     },

//     // Booking details (service or test drive) — mirrors the mock booking
//     // write-back so the transcript, the tool call, and the calendar UI agree.
//     booking: {
//       date: { type: String, default: null }, // e.g. "2026-07-14"
//       time: { type: String, default: null }, // e.g. "10:30am"
//       type: {
//         type: String,
//         enum: ["service", "test_drive", null],
//         default: null,
//       },
//       booking_ref: { type: String, default: null },
//     },

//     upgrade_interest_level: {
//       type: String,
//       enum: ["none", "low", "medium", "high", null],
//       default: null,
//     },
//     objections: { type: [String], default: [] },
//     recommended_next_action: { type: String, default: null },

//     ai_summary: { type: String, default: null },
//     sentiment: {
//       type: String,
//       enum: ["positive", "neutral", "negative"],
//       default: "neutral",
//     },
//     confidence_score: { type: Number, default: null },
//     escalated: { type: Boolean, default: false },
//     full_transcript: { type: Array, default: [] },
//   },
//   { timestamps: true },
// );

// const CallLog = mongoose.model("PCCallLog", callLogSchema);

// // ─── Simulation Customer Schema (replaces "Google Sheet" test-sheet import) ───
// // Requirements doc says "upload test sheet (Google Sheet)". Implemented here
// // as CSV import/export instead, per instruction — no external OAuth/Sheets
// // API dependency, works with any spreadsheet tool via CSV.
// const simulationCustomerSchema = new mongoose.Schema(
//   {
//     id: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     phone: { type: String, default: null }, // synthetic/internal test number
//     vehicle: { type: String, required: true },
//     brand: {
//       type: String,
//       enum: ["Toyota", "Mercedes-Benz", "Isuzu"],
//       required: true,
//     },
//     suburb: { type: String, default: null },
//     scenario: {
//       type: String,
//       enum: [
//         "service_due",
//         "upgrade_opportunity",
//         "finance_renewal",
//         "objection_handling",
//         "callback_follow_up",
//       ],
//       required: true,
//     },
//     lastService: { type: String, default: null },
//     upgradeScore: { type: Number, default: 3 },
//     batchLabel: { type: String, default: null }, // groups rows from one CSV upload
//   },
//   { timestamps: true },
// );

// const SimulationCustomer = mongoose.model(
//   "PCSimulationCustomer",
//   simulationCustomerSchema,
// );

// // ─── Mock Booking Schema ───────────────────────────────────────────────────────
// // Requirements doc: "Mock booking calendar & confirmation UI that writes
// // fake booking ref back." This is the write-back store for that UI.
// const mockBookingSchema = new mongoose.Schema(
//   {
//     id: { type: String, required: true, unique: true },
//     booking_ref: { type: String, required: true, unique: true },
//     sessionId: { type: String, default: null },
//     customer_name: { type: String, required: true },
//     phone: { type: String, default: null },
//     vehicle: { type: String, default: null },
//     brand: { type: String, default: null },
//     type: { type: String, enum: ["service", "test_drive"], required: true },
//     date: { type: String, required: true },
//     time: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ["confirmed", "cancelled"],
//       default: "confirmed",
//     },
//     notes: { type: String, default: null },
//   },
//   { timestamps: true },
// );

// const MockBooking = mongoose.model("PCMockBooking", mockBookingSchema);

// // ─── Recordings directory ─────────────────────────────────────────────────────
// const RECORDINGS_DIR = path.join(__dirname, "recordings");
// if (!fs.existsSync(RECORDINGS_DIR))
//   fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

// const UPLOADS_DIR = path.join(__dirname, "uploads");
// if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// // ─── Express + Socket.IO ──────────────────────────────────────────────────────
// const app = express();
// app.use(cors({ origin: "*" }));

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });
// const upload = multer({ dest: UPLOADS_DIR });

// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));
// app.use("/recordings", express.static(RECORDINGS_DIR));

// // ─── Session State ────────────────────────────────────────────────────────────
// const sessions = new Map();
// const prewarmStates = new Map();
// const prewarmTimers = new Map();

// // ─── Dealership Knowledge Base ─────────────────────────────────────────────────
// // Replaces the BYD single-brand product catalogue with the Patterson Cheney
// // multi-franchise knowledge the outbound agent actually needs: dealer
// // policy, service/finance/trade-in facts, and objection-handling material.
// // Model-specific facts (the customer's own car) come from CONTEXT INJECTION
// // per call (name, vehicle, brand, suburb, lastService, upgradeScore,
// // scenario) — NOT hardcoded here, since every call is about a different car.
// const PC_KNOWLEDGE_SUMMARY = `
// PATTERSON CHENEY — DEALERSHIP GROUP FACTS:

// FRANCHISES:
// - Toyota (Keysborough) — passenger, SUV, HiLux/LandCruiser commercial range
// - Mercedes-Benz (Berwick / Brighton) — passenger cars, SUVs, AMG performance
// - Isuzu UTE (Dandenong) — D-MAX, MU-X

// SERVICE:
// - Standard scheduled service booking, capped-price servicing on eligible models
// - Loan car / shuttle service available on request, subject to availability
// - Typical service bay slots: weekday mornings (8–10am) and early afternoon (1–3pm) tend to have the most availability
// - Reminder SMS + calendar invite sent automatically once a booking is confirmed

// FINANCE / TRADE-IN:
// - Trade-in valuations available same-day, obligation-free
// - Finance renewal: team can review current term and quote new finance/lease options near term-end
// - Cannot quote exact finance rates or trade-in dollar figures on the call — always hand to a consultant for a firm number

// WARRANTY / OWNERSHIP:
// - New vehicle warranty terms vary by franchise (Toyota/Mercedes-Benz/Isuzu) — confirm with a consultant if asked for exact years/km, don't guess

// COMPLIANCE:
// - Every call opens with a recording disclosure
// - Never quote a firm price, interest rate, or trade-in value — that's a "connect you with a consultant" moment, not a number you state yourself
// `.trim();

// const SCENARIO_GUIDANCE = {
//   service_due: {
//     goal: "service_booking",
//     opener:
//       "You're calling because their vehicle is due, or coming up due, for scheduled maintenance. Confirm the last service date, explain it's time to book, and offer 2–3 concrete slots.",
//   },
//   upgrade_opportunity: {
//     goal: "upgrade_qualification",
//     opener:
//       "You're calling a high-value owner about trade-in/upgrade opportunities. Lead with genuine interest in their current car, then gauge appetite for upgrading in the next 6–12 months.",
//   },
//   finance_renewal: {
//     goal: "finance_renewal_inquiry",
//     opener:
//       "Their finance term is ending soon. You're calling to flag that and see if they want the team to prepare renewal or new-finance options.",
//   },
//   objection_handling: {
//     goal: "objection_handling",
//     opener:
//       "This call is a practice/QA run focused on objection handling — expect pushback (too busy, too expensive, bad past experience, not interested). Stay calm, acknowledge, and offer a low-commitment next step.",
//   },
//   callback_follow_up: {
//     goal: "callback_follow_up",
//     opener:
//       "You're following up on a previous inquiry or a callback the customer requested. Reference that briefly and pick the conversation back up.",
//   },
// };

// // ─── System Prompt ────────────────────────────────────────────────────────────
// // Restructured for the OUTBOUND flow described in the requirements doc:
// // Opening & Verification -> Context Setting (service or upgrade) ->
// // Objection Handling / FAQ -> Warm Transfer if needed -> Close & Log.
// function getSystemPrompt(customerContext) {
//   const scenario = customerContext?.scenario
//     ? SCENARIO_GUIDANCE[customerContext.scenario]
//     : null;

//   const contextBlock = customerContext
//     ? `
// =============================================================
// ACTIVE CALL CONTEXT — THIS CALL IS ABOUT THIS CUSTOMER ONLY
// =============================================================
// Customer name: ${customerContext.name || "unknown — verify at open"}
// Vehicle: ${customerContext.vehicle || "unknown"}
// Franchise: ${customerContext.brand || "unknown"}
// Suburb: ${customerContext.suburb || "unknown"}
// Last service: ${customerContext.lastService || "unknown"}
// Upgrade propensity score (1-5, internal only, never say this number aloud): ${customerContext.upgradeScore ?? "n/a"}
// Call scenario: ${customerContext.scenario || "general"}
// ${scenario ? `Primary goal this call: ${scenario.goal}\nApproach: ${scenario.opener}` : ""}
// =============================================================
// `
//     : `
// No customer context was supplied for this call — treat it as a general
// inbound/test call. Ask for the customer's name and vehicle before doing
// anything else.
// `;

//   return `
// =============================================================
// ABSOLUTE RULE — ENGLISH ONLY. THIS OVERRIDES EVERYTHING.
// =============================================================
// You MUST respond in English only. If the caller speaks another language,
// say: "Sorry, I can only assist in English at the moment."
// =============================================================

// ### IDENTITY ###
// You are Aria, the AI voice agent for Patterson Cheney, an Australian multi-franchise
// dealership group representing Toyota, Mercedes-Benz, and Isuzu UTE. You place
// OUTBOUND calls to existing customers — service reminders, upgrade/trade-in
// check-ins, finance renewal check-ins, and callback follow-ups. You are not a
// generic call-centre bot — you sound like a warm, switched-on Australian
// dealership rep who already knows who they're calling and why.
// ${contextBlock}
// ### AI / RECORDING DISCLOSURE — COMPLIANCE, NOT OPTIONAL ###
// - Every call MUST open by identifying yourself and disclosing the call may
//   be recorded, e.g.: "Hi, this is Aria calling from Patterson Cheney
//   ${customerContext?.brand ? customerContext.brand : ""} — just so you know,
//   this call may be recorded for quality purposes."
// - Do NOT otherwise volunteer that you are AI.
// - ONLY if explicitly asked "are you a robot / AI / real person?" — be honest:
//   "Good question — I'm actually an AI assistant helping the Patterson Cheney
//   team reach out about your vehicle. I can help book that in or answer
//   questions — how can I help?"
// - Pivot straight back to the call's purpose.

// ### PERSONALITY ###
// - Friendly, warm Australian manner — this is a relationship call, not a cold sales pitch
// - Genuinely interested in the customer's current car and situation
// - Never pushy — consultative, especially on the upgrade/finance angle
// - Natural fillers: "absolutely", "no worries", "good to hear", "for sure"
// - Match caller energy: relaxed with relaxed callers, efficient with busy ones
// - If the customer says now is a bad time, offer to call back at a better time and end warmly — do not push on

// ### HOW YOU TALK ###
// - SHORT responses — 1 to 2 sentences max
// - Contractions: "what's", "we've", "I'll", "you're", "that's"
// - ACKNOWLEDGE first, then respond
// - ONE question at a time — never stack questions
// - Silence/can't hear: "Still there?" or "Sorry, didn't catch that — could you say that again?"

// ### DEALERSHIP KNOWLEDGE ###
// ${PC_KNOWLEDGE_SUMMARY}

// =============================================================
// CALL FLOW
// =============================================================

// STEP 01 — OPENING & VERIFICATION
// "Hi, is this ${customerContext?.name || "[customer name]"}? ... Hi ${customerContext?.name ? customerContext.name.split(" ")[0] : "[name]"}, this is Aria calling from Patterson Cheney ${customerContext?.brand || ""} — just so you know this call may be recorded for quality purposes. Is now an okay time for a quick chat?"
// If they say it's a bad time: offer a callback time, thank them, end the call, and still call save_call_log with outcome "callback_scheduled".

// STEP 02 — CONTEXT SETTING (scenario-specific)
// ${
//   scenario
//     ? `Goal: ${scenario.goal}. ${scenario.opener}`
//     : "Establish why you're calling based on their situation, then move to a clear ask."
// }

// For SERVICE DUE:
// "Our records show your ${customerContext?.vehicle || "[vehicle]"} was last serviced on ${customerContext?.lastService || "[date]"}, so it's coming up due for its next scheduled maintenance. Keen to lock that in?"
// Offer 2–3 concrete slots (see service knowledge above for realistic windows), or capture a preferred day/time window.
// Handle objections (cost, timing, transport) — acknowledge, then offer the loan car/shuttle info or a more convenient slot.

// For UPGRADE OPPORTUNITY:
// "While I've got you — a lot of ${customerContext?.vehicle || "your model"} owners are taking advantage of current trade-in values on the newer range. Is that something you've thought about in the next 6 to 12 months?"
// Qualify budget/timeline/must-have features lightly. If warm, offer to book a test drive or transfer to a sales consultant. If cold, thank them and close politely — don't push.

// For FINANCE RENEWAL:
// Flag that their finance term is ending soon and ask if they'd like the team to prepare renewal/new options. Never quote a rate — offer to have a consultant call with real numbers.

// For OBJECTION HANDLING (practice scenario):
// Expect pushback. Acknowledge the objection in one sentence, offer a genuinely lower-commitment next step (e.g. "no pressure at all — can I just pencil in a callback for next week instead?"), and don't argue.

// STEP 03 — BOOKING (when the customer agrees to a slot)
// Collect, one at a time: which vehicle/service, preferred date, preferred time, best contact number.
// Once confirmed, treat the slot as booked in this conversation and include it as
// "booking": { "date", "time", "type": "service" or "test_drive" } in save_call_log —
// the platform will generate the confirmation and booking reference from that.
// Tell the customer: "Great, you're locked in for [date] at [time] — you'll get an SMS confirmation and calendar invite shortly."

// STEP 04 — WARM TRANSFER
// Trigger for: firm finance/trade-in numbers, complaints/disputes, complex negotiation, or the customer directly asking for a person.
// Say: "I want to make sure you get the right numbers on this — let me get one of our consultants to give you a call. Just confirming, is ${customerContext?.name || "this"} still the best number to reach you on?"
// Set outcome to "transferred_to_human" and escalated: true.

// STEP 05 — CLOSE
// Never end passively. Confirm next step out loud, thank them by name, end warmly.

// =============================================================
// STEP 06 — SAVE CALL LOG (MANDATORY after every completed call)
// =============================================================
// After every call where purpose was established, call save_call_log with as
// much of the structured detail as you actually gathered — don't guess. This
// is the ONLY source for outcome category, booking details, upgrade interest
// level, objections, sentiment, and recommended next action, so be accurate
// and specific rather than generic.

// =============================================================
// HARD RULES
// =============================================================
// - ENGLISH ONLY
// - Open every call with the recording disclosure
// - ONE question at a time
// - 1–2 sentences max per response
// - NEVER assume caller's name — verify it
// - NEVER state a firm price, interest rate, or trade-in dollar value — hand that to a consultant
// - ALWAYS call save_call_log after every completed call
// `.trim();
// }

// // ─── Tool Definition ──────────────────────────────────────────────────────────
// function getSaveCallLogTool() {
//   return {
//     type: "function",
//     name: "save_call_log",
//     description:
//       "Saves a structured call log after every completed Patterson Cheney outbound call. MUST be called once the call reaches a natural conclusion (booked, declined, transferred, callback, or no engagement).",
//     parameters: {
//       type: "object",
//       properties: {
//         caller_name: {
//           type: "string",
//           description: "Full name of the customer",
//         },
//         caller_phone: { type: "string", description: "Best contact number" },
//         caller_email: {
//           type: "string",
//           description: "Customer email if given",
//         },
//         vehicle_interest: {
//           type: "string",
//           description: "Vehicle discussed, e.g. '2021 Toyota HiLux SR5'",
//         },
//         intent_category: {
//           type: "string",
//           enum: [
//             "service_booking",
//             "upgrade_qualification",
//             "finance_renewal_inquiry",
//             "objection_handling",
//             "faq",
//             "staff_transfer",
//             "callback_follow_up",
//             "no_transcript_admin",
//           ],
//         },
//         outcome: {
//           type: "string",
//           enum: [
//             "service_booked",
//             "callback_scheduled",
//             "transferred_to_human",
//             "info_provided",
//             "test_drive_booked",
//             "declined",
//             "message_taken",
//             "escalated",
//             "no_answer",
//           ],
//         },
//         booking: {
//           type: "object",
//           description: "Only include if a slot was actually agreed on the call",
//           properties: {
//             date: { type: "string", description: "e.g. '2026-07-14'" },
//             time: { type: "string", description: "e.g. '10:30am'" },
//             type: { type: "string", enum: ["service", "test_drive"] },
//           },
//         },
//         upgrade_interest_level: {
//           type: "string",
//           enum: ["none", "low", "medium", "high"],
//         },
//         objections: {
//           type: "array",
//           items: { type: "string" },
//           description:
//             "Key objections raised, e.g. ['too expensive', 'no time']",
//         },
//         recommended_next_action: {
//           type: "string",
//           description:
//             "One sentence: what should staff do next with this customer",
//         },
//         ai_summary: {
//           type: "string",
//           description: "2-3 sentence summary of the call",
//         },
//         sentiment: {
//           type: "string",
//           enum: ["positive", "neutral", "negative"],
//         },
//         confidence_score: { type: "number", description: "0.0 to 1.0" },
//         escalated: { type: "boolean" },
//       },
//       required: ["caller_name", "intent_category", "outcome"],
//     },
//   };
// }

// // ─── Recording (WAV builder) — unchanged from base implementation ─────────────
// class ConversationRecorder {
//   constructor(sessionId) {
//     this.sessionId = sessionId;
//     this.userChunks = [];
//     this.agentChunks = [];
//     this.startTime = Date.now();
//     this.events = [];
//   }
//   addUserAudio(base64Pcm16) {
//     const buf = Buffer.from(base64Pcm16, "base64");
//     this.userChunks.push(buf);
//     this.events.push({
//       type: "user",
//       time: Date.now() - this.startTime,
//       bytes: buf.length,
//     });
//   }
//   addAgentAudio(base64Pcm16) {
//     const buf = Buffer.from(base64Pcm16, "base64");
//     this.agentChunks.push(buf);
//     this.events.push({
//       type: "agent",
//       time: Date.now() - this.startTime,
//       bytes: buf.length,
//     });
//   }
//   _resample(pcmBuffer, srcRate, dstRate) {
//     if (srcRate === dstRate) return pcmBuffer;
//     const srcSamples = pcmBuffer.length / 2;
//     const ratio = srcRate / dstRate;
//     const dstSamples = Math.floor(srcSamples / ratio);
//     const out = Buffer.alloc(dstSamples * 2);
//     for (let i = 0; i < dstSamples; i++) {
//       const srcIdx = i * ratio;
//       const lo = Math.floor(srcIdx);
//       const hi = Math.min(lo + 1, srcSamples - 1);
//       const frac = srcIdx - lo;
//       const sLo = pcmBuffer.readInt16LE(lo * 2);
//       const sHi = pcmBuffer.readInt16LE(hi * 2);
//       const val = Math.round(sLo + (sHi - sLo) * frac);
//       out.writeInt16LE(Math.max(-32768, Math.min(32767, val)), i * 2);
//     }
//     return out;
//   }
//   saveToFile() {
//     const OUTPUT_RATE = 24000;
//     const userPcm = Buffer.concat(this.userChunks);
//     const agentPcm = this._resample(
//       Buffer.concat(this.agentChunks),
//       16000,
//       OUTPUT_RATE,
//     );
//     const totalSamples = Math.max(userPcm.length / 2, agentPcm.length / 2);
//     const mixed = Buffer.alloc(totalSamples * 2);
//     for (let i = 0; i < totalSamples; i++) {
//       let v = 0;
//       if (i < userPcm.length / 2) v += userPcm.readInt16LE(i * 2);
//       if (i < agentPcm.length / 2) v += agentPcm.readInt16LE(i * 2);
//       mixed.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
//     }
//     const hdr = Buffer.alloc(44);
//     const dataSize = mixed.length;
//     hdr.write("RIFF", 0);
//     hdr.writeUInt32LE(36 + dataSize, 4);
//     hdr.write("WAVE", 8);
//     hdr.write("fmt ", 12);
//     hdr.writeUInt32LE(16, 16);
//     hdr.writeUInt16LE(1, 20);
//     hdr.writeUInt16LE(1, 22);
//     hdr.writeUInt32LE(OUTPUT_RATE, 24);
//     hdr.writeUInt32LE(OUTPUT_RATE * 2, 28);
//     hdr.writeUInt16LE(2, 32);
//     hdr.writeUInt16LE(16, 34);
//     hdr.write("data", 36);
//     hdr.writeUInt32LE(dataSize, 40);
//     const wav = Buffer.concat([hdr, mixed]);
//     const filename = `pc_call_${this.sessionId}_${Date.now()}.wav`;
//     const filepath = path.join(RECORDINGS_DIR, filename);
//     fs.writeFileSync(filepath, wav);
//     console.log(
//       `[Recording] Saved: ${filename} (${(wav.length / 1024 / 1024).toFixed(2)} MB)`,
//     );
//     return {
//       filename,
//       filepath,
//       sizeMB: (wav.length / 1024 / 1024).toFixed(2),
//     };
//   }
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function sendWsJson(ws, payload) {
//   if (!ws || ws.readyState !== WebSocket.OPEN) return false;
//   ws.send(JSON.stringify(payload));
//   return true;
// }

// function toFunctionCallPayload(value) {
//   if (!value || typeof value !== "object") return null;
//   if (
//     (value.type === "function_call" || true) &&
//     typeof value.name === "string" &&
//     typeof value.arguments === "string" &&
//     typeof value.call_id === "string"
//   ) {
//     return {
//       name: value.name,
//       arguments: value.arguments,
//       call_id: value.call_id,
//     };
//   }
//   return null;
// }

// function extractFunctionCallsFromResponse(response) {
//   const calls = [];
//   const output = response?.output;
//   if (Array.isArray(output)) {
//     for (const item of output) {
//       const fc = toFunctionCallPayload(item);
//       if (fc) calls.push(fc);
//     }
//   }
//   return calls;
// }

// // ─── CSV helpers (replaces "Google Sheet" test-sheet import/export) ──────────
// // Minimal dependency-free CSV parser/writer — good enough for the flat,
// // comma-separated test-sheet schema this feature needs. Handles quoted
// // fields containing commas.
// function parseCsv(text) {
//   const rows = [];
//   let row = [];
//   let field = "";
//   let inQuotes = false;
//   const pushField = () => {
//     row.push(field);
//     field = "";
//   };
//   const pushRow = () => {
//     rows.push(row);
//     row = [];
//   };

//   for (let i = 0; i < text.length; i++) {
//     const c = text[i];
//     if (inQuotes) {
//       if (c === '"') {
//         if (text[i + 1] === '"') {
//           field += '"';
//           i++;
//         } else inQuotes = false;
//       } else field += c;
//     } else {
//       if (c === '"') inQuotes = true;
//       else if (c === ",") pushField();
//       else if (c === "\n") {
//         pushField();
//         pushRow();
//       } else if (c === "\r") {
//         /* skip */
//       } else field += c;
//     }
//   }
//   if (field.length || row.length) {
//     pushField();
//     pushRow();
//   }

//   const filtered = rows.filter((r) => r.some((v) => v.trim() !== ""));
//   if (filtered.length === 0) return [];
//   const headers = filtered[0].map((h) => h.trim());
//   return filtered.slice(1).map((r) => {
//     const obj = {};
//     headers.forEach((h, idx) => {
//       obj[h] = (r[idx] || "").trim();
//     });
//     return obj;
//   });
// }

// function toCsvValue(val) {
//   const s = val === null || val === undefined ? "" : String(val);
//   if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
//   return s;
// }

// function toCsv(rows, columns) {
//   const header = columns.join(",");
//   const lines = rows.map((r) => columns.map((c) => toCsvValue(r[c])).join(","));
//   return [header, ...lines].join("\n");
// }

// // ─── End-of-call summary generator ────────────────────────────────────────────
// async function generateCallSummary(transcriptArray) {
//   if (!transcriptArray || transcriptArray.length === 0) {
//     return {
//       summary: "No conversation took place.",
//       sentiment: "neutral",
//       intent_category: "no_transcript_admin",
//       outcome: "no_answer",
//       caller_name: null,
//       vehicle_interest: null,
//       upgrade_interest_level: "none",
//       objections: [],
//       recommended_next_action: "Retry the call at a different time.",
//       confidence_score: 0,
//     };
//   }

//   const conversationText = transcriptArray
//     .map((t) => `${t.role === "user" ? "Customer" : "Agent"}: ${t.text}`)
//     .join("\n");

//   const prompt = `You are summarizing a phone call transcript from a Patterson Cheney dealership outbound voice agent call (service reminders / upgrade qualification / finance renewal / objection handling / callback follow-up).

// TRANSCRIPT:
// ${conversationText}

// Return ONLY a JSON object (no markdown, no preamble) with these fields:
// {
//   "summary": "2-3 sentence summary of what happened on the call",
//   "sentiment": "positive" | "neutral" | "negative",
//   "intent_category": one of ["service_booking","upgrade_qualification","finance_renewal_inquiry","objection_handling","faq","staff_transfer","callback_follow_up","no_transcript_admin"],
//   "outcome": one of ["service_booked","callback_scheduled","transferred_to_human","info_provided","test_drive_booked","declined","message_taken","escalated","no_answer"],
//   "caller_name": "name if mentioned, else null",
//   "vehicle_interest": "vehicle model if mentioned, else null",
//   "booking": { "date": "date if a slot was agreed, else null", "time": "time if agreed, else null", "type": "'service' or 'test_drive' or null" },
//   "upgrade_interest_level": "none" | "low" | "medium" | "high",
//   "objections": ["short phrases for each objection raised, empty array if none"],
//   "recommended_next_action": "one sentence: what staff should do next with this customer",
//   "confidence_score": number between 0 and 1
// }`;

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: OPENAI_SUMMARY_MODEL,
//         messages: [{ role: "user", content: prompt }],
//         response_format: { type: "json_object" },
//         temperature: 0.3,
//       }),
//     });
//     const data = await response.json();
//     const raw = data?.choices?.[0]?.message?.content;
//     if (!raw) throw new Error("No content returned from summary model");
//     return JSON.parse(raw);
//   } catch (err) {
//     console.error("Summary generation failed:", err.message);
//     return {
//       summary: "Summary generation failed.",
//       sentiment: "neutral",
//       intent_category: "no_transcript_admin",
//       outcome: "message_taken",
//       caller_name: null,
//       vehicle_interest: null,
//       upgrade_interest_level: "none",
//       objections: [],
//       recommended_next_action: null,
//       confidence_score: 0,
//     };
//   }
// }

// // ─── OpenAI Realtime Session ──────────────────────────────────────────────────
// function createRealtimeSession(sessionId, onEvent, customerContext) {
//   const url = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
//   const startMs = Date.now();

//   return new Promise((resolve, reject) => {
//     const ws = new WebSocket(url, {
//       headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
//     });

//     ws.on("open", () => {
//       console.log(
//         `[${sessionId}] OpenAI Realtime connected (${Date.now() - startMs}ms)${customerContext ? ` | Customer: ${customerContext.name} / ${customerContext.vehicle}` : ""}`,
//       );

//       sendWsJson(ws, {
//         type: "session.update",
//         session: {
//           type: "realtime",
//           model: OPENAI_REALTIME_MODEL,
//           output_modalities: ["text"],
//           audio: {
//             input: {
//               format: { type: "audio/pcm", rate: OPENAI_INPUT_SAMPLE_RATE },
//               turn_detection: {
//                 type: "server_vad",
//                 threshold: OPENAI_VAD_THRESHOLD,
//                 prefix_padding_ms: OPENAI_VAD_PREFIX_PADDING_MS,
//                 silence_duration_ms: OPENAI_VAD_SILENCE_DURATION_MS,
//               },
//             },
//           },
//           instructions: getSystemPrompt(customerContext || null),
//           tools: [getSaveCallLogTool()],
//           tool_choice: "auto",
//         },
//       });

//       const session = {
//         ws,
//         customerContext: customerContext || null,
//         elevenLabsWs: null,
//         elevenLabsReady: false,
//         textBuffer: [],
//         isResponseActive: false,
//         onEvent,
//         startMs,
//         openAiConnectedMs: Date.now(),
//         elevenLabsConnectedMs: null,
//         greetingTriggeredMs: null,
//         firstResponseCreatedMs: null,
//         firstAudioDeltaLogged: false,
//         processedCallIds: new Set(),
//         recorder: new ConversationRecorder(sessionId),
//         callLogs: [],
//         elevenLabsOpening: false,
//         transcript: [],
//         currentAssistantText: "",
//       };

//       sessions.set(sessionId, session);
//       openElevenLabsStream(sessionId);
//       resolve();
//     });

//     ws.on("message", async (data) => {
//       try {
//         const event = JSON.parse(data.toString());
//         await handleRealtimeEvent(sessionId, event);
//       } catch (err) {
//         console.error(`[${sessionId}] Parse error:`, err.message);
//       }
//     });

//     ws.on("error", (err) => {
//       console.error(`[${sessionId}] OpenAI WS error:`, err.message);
//       onEvent({ type: "error", error: { message: err.message } });
//       reject(err);
//     });

//     ws.on("close", (code) => {
//       console.log(`[${sessionId}] OpenAI WS closed: ${code}`);
//       closeElevenLabsWs(sessionId);
//       sessions.delete(sessionId);
//       onEvent({ type: "session-closed" });
//     });
//   });
// }

// // ─── Audio helpers ────────────────────────────────────────────────────────────
// function sendAudio(sessionId, base64Audio) {
//   const session = sessions.get(sessionId);
//   if (!session) return;
//   session.recorder.addUserAudio(base64Audio);
//   sendWsJson(session.ws, {
//     type: "input_audio_buffer.append",
//     audio: base64Audio,
//   });
// }

// // ─── Trigger greeting — customer-context-aware ────────────────────────────────
// function triggerGreeting(sessionId) {
//   const session = sessions.get(sessionId);
//   if (!session) return;
//   session.greetingTriggeredMs = Date.now();

//   if (session.customerContext) {
//     const ctx = session.customerContext;
//     const primeMessage =
//       `This is a simulated OUTBOUND call. You are calling ${ctx.name}, who owns a ` +
//       `${ctx.vehicle}. Scenario: ${ctx.scenario || "general"}. Open with the ` +
//       `mandatory recording disclosure, verify you're speaking with ${ctx.name}, ` +
//       `then move into the call purpose for this scenario.`;

//     sendWsJson(session.ws, {
//       type: "conversation.item.create",
//       item: {
//         type: "message",
//         role: "user",
//         content: [{ type: "input_text", text: primeMessage }],
//       },
//     });
//   }

//   sendWsJson(session.ws, { type: "response.create" });
// }

// // ─── ElevenLabs TTS ───────────────────────────────────────────────────────────
// function _openNewElevenLabsStream(sessionId) {
//   const session = sessions.get(sessionId);
//   if (!session) return;
//   if (session.elevenLabsOpening) return;
//   session.elevenLabsOpening = true;

//   const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream-input?model_id=eleven_multilingual_v2&output_format=pcm_16000`;
//   const elWs = new WebSocket(wsUrl);

//   elWs.on("open", () => {
//     if (!sessions.has(sessionId) || session.elevenLabsWs !== elWs) {
//       elWs.close();
//       return;
//     }
//     session.elevenLabsConnectedMs = Date.now();
//     session.elevenLabsOpening = false;
//     elWs.send(
//       JSON.stringify({
//         text: " ",
//         voice_settings: {
//           stability: 0.5,
//           similarity_boost: 0.8,
//           style: 0.3,
//           use_speaker_boost: true,
//         },
//         xi_api_key: ELEVENLABS_API_KEY,
//       }),
//     );
//     session.elevenLabsReady = true;
//     for (const text of session.textBuffer) {
//       if (elWs.readyState === WebSocket.OPEN)
//         elWs.send(JSON.stringify({ text, try_trigger_generation: true }));
//     }
//     session.textBuffer = [];
//   });

//   elWs.on("message", (data) => {
//     try {
//       const msg = JSON.parse(data.toString());
//       if (msg.audio) {
//         session.recorder.addAgentAudio(msg.audio);
//         session.onEvent({ type: "audio-delta", delta: msg.audio });
//       }
//     } catch {}
//   });

//   elWs.on("error", (err) => {
//     console.warn(`[${sessionId}] ElevenLabs error: ${err.message}`);
//     session.elevenLabsOpening = false;
//   });

//   elWs.on("close", () => {
//     if (session.elevenLabsWs === elWs) {
//       session.elevenLabsReady = false;
//       session.elevenLabsOpening = false;
//     }
//   });

//   session.elevenLabsWs = elWs;
// }

// function openElevenLabsStream(sessionId, force = false) {
//   const session = sessions.get(sessionId);
//   if (!session) return;
//   const oldWs = session.elevenLabsWs;

//   if (!force) {
//     if (
//       oldWs &&
//       (oldWs.readyState === WebSocket.OPEN ||
//         oldWs.readyState === WebSocket.CONNECTING)
//     )
//       return;
//     _openNewElevenLabsStream(sessionId);
//     return;
//   }

//   session.textBuffer = [];
//   session.elevenLabsReady = false;

//   if (
//     !oldWs ||
//     oldWs.readyState === WebSocket.CLOSED ||
//     oldWs.readyState === WebSocket.CLOSING
//   ) {
//     session.elevenLabsWs = null;
//     session.elevenLabsOpening = false;
//     _openNewElevenLabsStream(sessionId);
//     return;
//   }

//   if (oldWs.readyState === WebSocket.CONNECTING) {
//     session.elevenLabsWs = null;
//     session.elevenLabsOpening = false;
//     try {
//       oldWs.terminate();
//     } catch (_) {}
//     _openNewElevenLabsStream(sessionId);
//     return;
//   }

//   session.elevenLabsWs = null;
//   session.elevenLabsOpening = false;
//   try {
//     oldWs.send(JSON.stringify({ text: "" }));
//   } catch (_) {}

//   oldWs.once("close", () => {
//     if (!sessions.has(sessionId)) return;
//     const s = sessions.get(sessionId);
//     if (s && !s.elevenLabsWs && !s.elevenLabsOpening)
//       _openNewElevenLabsStream(sessionId);
//   });

//   setTimeout(() => {
//     if (!sessions.has(sessionId)) return;
//     const s = sessions.get(sessionId);
//     if (s && !s.elevenLabsWs && !s.elevenLabsOpening)
//       _openNewElevenLabsStream(sessionId);
//   }, 800);

//   try {
//     oldWs.close();
//   } catch (_) {}
// }

// function sendTextToElevenLabs(sessionId, text) {
//   const session = sessions.get(sessionId);
//   if (!session) return;
//   if (
//     session.elevenLabsWs?.readyState === WebSocket.OPEN &&
//     session.elevenLabsReady
//   ) {
//     session.elevenLabsWs.send(
//       JSON.stringify({ text, try_trigger_generation: true }),
//     );
//   } else {
//     session.textBuffer.push(text);
//   }
// }

// function flushElevenLabsStream(sessionId) {
//   const session = sessions.get(sessionId);
//   if (session?.elevenLabsWs?.readyState === WebSocket.OPEN) {
//     session.elevenLabsWs.send(JSON.stringify({ text: "" }));
//   }
// }

// function closeElevenLabsWs(sessionId) {
//   const session = sessions.get(sessionId);
//   if (session?.elevenLabsWs) {
//     try {
//       if (session.elevenLabsWs.readyState === WebSocket.CONNECTING)
//         session.elevenLabsWs.terminate();
//       else if (session.elevenLabsWs.readyState === WebSocket.OPEN)
//         session.elevenLabsWs.close();
//     } catch {}
//     session.elevenLabsWs = null;
//     session.elevenLabsReady = false;
//     session.elevenLabsOpening = false;
//     session.textBuffer = [];
//   }
// }

// // ─── Mock booking write-back ──────────────────────────────────────────────────
// function generateBookingRef() {
//   const stamp = Date.now().toString(36).toUpperCase().slice(-4);
//   const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
//   return `PC-${stamp}${rand}`;
// }

// async function createMockBooking({
//   sessionId,
//   customer_name,
//   phone,
//   vehicle,
//   brand,
//   type,
//   date,
//   time,
//   notes,
// }) {
//   const booking_ref = generateBookingRef();
//   const doc = new MockBooking({
//     id: uuidv4(),
//     booking_ref,
//     sessionId: sessionId || null,
//     customer_name,
//     phone: phone || null,
//     vehicle: vehicle || null,
//     brand: brand || null,
//     type,
//     date,
//     time,
//     notes: notes || null,
//   });
//   await doc.save();
//   return doc;
// }

// // ─── Function call handler ────────────────────────────────────────────────────
// async function handleFunctionCall(sessionId, eventOrItem) {
//   const session = sessions.get(sessionId);
//   if (!session) return;

//   const call = toFunctionCallPayload(eventOrItem);
//   if (!call || call.name !== "save_call_log") return;

//   const callId = typeof call.call_id === "string" ? call.call_id : null;
//   if (callId && session.processedCallIds.has(callId)) return;
//   if (callId) session.processedCallIds.add(callId);

//   try {
//     const args = JSON.parse(call.arguments);
//     console.log(
//       `[${sessionId}] Saving call log | name: ${args.caller_name} | intent: ${args.intent_category} | outcome: ${args.outcome}`,
//     );

//     // If a booking was agreed on the call, write it to the mock booking
//     // calendar and attach the generated reference to the log.
//     let bookingRecord = null;
//     if (args.booking?.date && args.booking?.time) {
//       bookingRecord = await createMockBooking({
//         sessionId,
//         customer_name: args.caller_name,
//         phone: args.caller_phone,
//         vehicle: args.vehicle_interest || session.customerContext?.vehicle,
//         brand: session.customerContext?.brand,
//         type: args.booking.type || "service",
//         date: args.booking.date,
//         time: args.booking.time,
//       });
//       session.onEvent({
//         type: "mock-booking-created",
//         data: {
//           booking_ref: bookingRecord.booking_ref,
//           date: bookingRecord.date,
//           time: bookingRecord.time,
//           type: bookingRecord.type,
//         },
//       });
//     }

//     const logId = uuidv4();
//     const callLog = new CallLog({
//       id: logId,
//       sessionId,
//       isSimulation: true,
//       customerId: session.customerContext?.id || null,
//       brand: session.customerContext?.brand || null,
//       caller_name: args.caller_name || null,
//       caller_phone: args.caller_phone || null,
//       caller_email: args.caller_email || null,
//       vehicle_interest:
//         args.vehicle_interest || session.customerContext?.vehicle || null,
//       scenario: session.customerContext?.scenario || null,
//       intent_category: args.intent_category,
//       outcome: args.outcome,
//       booking: bookingRecord
//         ? {
//             date: bookingRecord.date,
//             time: bookingRecord.time,
//             type: bookingRecord.type,
//             booking_ref: bookingRecord.booking_ref,
//           }
//         : { date: null, time: null, type: null, booking_ref: null },
//       upgrade_interest_level: args.upgrade_interest_level || null,
//       objections: Array.isArray(args.objections) ? args.objections : [],
//       recommended_next_action: args.recommended_next_action || null,
//       ai_summary: args.ai_summary || null,
//       sentiment: args.sentiment || "neutral",
//       confidence_score: args.confidence_score || null,
//       escalated: args.escalated || false,
//       // Snapshot only — closeSession() re-syncs with the full transcript.
//       full_transcript: session.transcript || [],
//     });

//     await callLog.save();
//     session.callLogs.push({ id: logId, ...args });
//     console.log(`[${sessionId}] Call log saved to MongoDB: ${logId}`);

//     sendWsJson(session.ws, {
//       type: "conversation.item.create",
//       item: {
//         type: "function_call_output",
//         call_id: call.call_id,
//         output: JSON.stringify({
//           success: true,
//           message: "Call log saved successfully.",
//           log_id: logId,
//           outcome: args.outcome,
//           booking_ref: bookingRecord?.booking_ref || null,
//         }),
//       },
//     });
//     sendWsJson(session.ws, { type: "response.create" });
//     session.onEvent({
//       type: "call-logged",
//       data: { ...args, booking_ref: bookingRecord?.booking_ref || null },
//     });
//   } catch (err) {
//     if (callId) session.processedCallIds.delete(callId);
//     console.error(`[${sessionId}] Call log save failed:`, err.message);
//   }
// }

// // ─── OpenAI Event handler ─────────────────────────────────────────────────────
// async function handleRealtimeEvent(sessionId, event) {
//   const session = sessions.get(sessionId);
//   if (!session) return;

//   switch (event.type) {
//     case "session.created":
//     case "session.updated":
//       break;

//     case "response.created":
//       session.isResponseActive = true;
//       session.currentAssistantText = "";
//       if (!session.firstResponseCreatedMs)
//         session.firstResponseCreatedMs = Date.now();
//       if (
//         !session.elevenLabsWs ||
//         (session.elevenLabsWs.readyState !== WebSocket.OPEN &&
//           session.elevenLabsWs.readyState !== WebSocket.CONNECTING)
//       ) {
//         openElevenLabsStream(sessionId);
//       }
//       break;

//     case "response.output_text.delta":
//     case "response.text.delta":
//       sendTextToElevenLabs(sessionId, event.delta);
//       session.currentAssistantText += event.delta || "";
//       session.onEvent({ type: "transcript-delta", delta: event.delta });
//       break;

//     case "response.audio_transcript.delta":
//       sendTextToElevenLabs(sessionId, event.delta);
//       session.currentAssistantText += event.delta || "";
//       session.onEvent({ type: "transcript-delta", delta: event.delta });
//       break;

//     case "response.audio.delta":
//       if (event.delta) {
//         if (
//           !session.elevenLabsWs ||
//           session.elevenLabsWs.readyState !== WebSocket.OPEN
//         ) {
//           session.recorder.addAgentAudio(event.delta);
//           session.onEvent({ type: "audio-delta", delta: event.delta });
//         }
//       }
//       break;

//     case "response.audio.done":
//       break;

//     case "response.output_text.done":
//     case "response.text.done": {
//       flushElevenLabsStream(sessionId);
//       const assistantText = (
//         event.text ||
//         session.currentAssistantText ||
//         ""
//       ).trim();
//       if (assistantText)
//         session.transcript.push({
//           role: "assistant",
//           text: assistantText,
//           ts: Date.now(),
//         });
//       session.currentAssistantText = "";
//       session.onEvent({ type: "transcript-done", transcript: event.text });
//       break;
//     }

//     case "response.audio_transcript.done": {
//       flushElevenLabsStream(sessionId);
//       const aText = (
//         event.transcript ||
//         session.currentAssistantText ||
//         ""
//       ).trim();
//       if (aText)
//         session.transcript.push({
//           role: "assistant",
//           text: aText,
//           ts: Date.now(),
//         });
//       session.currentAssistantText = "";
//       session.onEvent({
//         type: "transcript-done",
//         transcript: event.transcript,
//       });
//       break;
//     }

//     case "response.done": {
//       session.isResponseActive = false;
//       const calls = extractFunctionCallsFromResponse(event.response);
//       for (const fc of calls) await handleFunctionCall(sessionId, fc);
//       break;
//     }

//     case "response.output_item.done":
//       if (event.item) {
//         const fc = toFunctionCallPayload(event.item);
//         if (fc) await handleFunctionCall(sessionId, fc);
//       }
//       break;

//     case "response.function_call_arguments.done":
//       await handleFunctionCall(sessionId, event);
//       break;

//     case "input_audio_buffer.speech_started":
//       if (session.isResponseActive) {
//         sendWsJson(session.ws, { type: "response.cancel" });
//         session.isResponseActive = false;
//         openElevenLabsStream(sessionId, true);
//       }
//       session.onEvent({ type: "clear-audio" });
//       session.onEvent({ type: "speech-started" });
//       break;

//     case "input_audio_buffer.speech_stopped":
//       break;

//     case "input_audio_buffer.committed":
//       break;

//     case "conversation.item.input_audio_transcription.completed":
//       if (event.transcript && event.transcript.trim()) {
//         session.transcript.push({
//           role: "user",
//           text: event.transcript.trim(),
//           ts: Date.now(),
//         });
//       }
//       session.onEvent({
//         type: "user-transcript",
//         transcript: event.transcript,
//       });
//       break;

//     case "error":
//       if (event.error && event.error.code === "response_cancel_not_active")
//         break;
//       console.error(
//         `[${sessionId}] OpenAI error:`,
//         JSON.stringify(event.error),
//       );
//       session.onEvent({ type: "error", error: event.error });
//       break;

//     default:
//       break;
//   }
// }

// // ─── Close session ────────────────────────────────────────────────────────────
// async function closeSession(sessionId) {
//   const session = sessions.get(sessionId);
//   if (!session) return;

//   const hadConversation = session.transcript && session.transcript.length > 0;

//   if (hadConversation) {
//     try {
//       const result = session.recorder.saveToFile();
//       session.onEvent({
//         type: "recording-saved",
//         data: {
//           filename: result.filename,
//           url: `/recordings/${result.filename}`,
//         },
//       });
//     } catch (err) {
//       console.error(`[${sessionId}] Recording save failed:`, err.message);
//     }

//     try {
//       const summaryData = await generateCallSummary(session.transcript);

//       session.onEvent({
//         type: "call-summary",
//         data: { ...summaryData, fullTranscript: session.transcript },
//       });

//       if (session.callLogs.length > 0) {
//         const updated = await CallLog.findOneAndUpdate(
//           { sessionId },
//           {
//             $set: {
//               full_transcript: session.transcript || [],
//               ai_summary: summaryData.summary || undefined,
//               sentiment: summaryData.sentiment || undefined,
//               upgrade_interest_level:
//                 summaryData.upgrade_interest_level || undefined,
//               objections: summaryData.objections || undefined,
//               recommended_next_action:
//                 summaryData.recommended_next_action || undefined,
//             },
//           },
//           { sort: { createdAt: -1 }, new: true },
//         );
//         console.log(
//           `[${sessionId}] Synced existing call log with full final transcript` +
//             (updated ? ` (id: ${updated.id})` : " (no matching row found)"),
//         );
//       } else {
//         let bookingRecord = null;
//         if (summaryData.booking?.date && summaryData.booking?.time) {
//           bookingRecord = await createMockBooking({
//             sessionId,
//             customer_name:
//               summaryData.caller_name ||
//               session.customerContext?.name ||
//               "Unknown",
//             vehicle:
//               summaryData.vehicle_interest || session.customerContext?.vehicle,
//             brand: session.customerContext?.brand,
//             type: summaryData.booking.type || "service",
//             date: summaryData.booking.date,
//             time: summaryData.booking.time,
//           });
//         }

//         const logId = uuidv4();
//         const callLog = new CallLog({
//           id: logId,
//           sessionId,
//           isSimulation: true,
//           customerId: session.customerContext?.id || null,
//           brand: session.customerContext?.brand || null,
//           caller_name: summaryData.caller_name || null,
//           vehicle_interest:
//             summaryData.vehicle_interest ||
//             session.customerContext?.vehicle ||
//             null,
//           scenario: session.customerContext?.scenario || null,
//           intent_category: summaryData.intent_category || "no_transcript_admin",
//           outcome: summaryData.outcome || "message_taken",
//           booking: bookingRecord
//             ? {
//                 date: bookingRecord.date,
//                 time: bookingRecord.time,
//                 type: bookingRecord.type,
//                 booking_ref: bookingRecord.booking_ref,
//               }
//             : { date: null, time: null, type: null, booking_ref: null },
//           upgrade_interest_level: summaryData.upgrade_interest_level || "none",
//           objections: summaryData.objections || [],
//           recommended_next_action: summaryData.recommended_next_action || null,
//           ai_summary: summaryData.summary || null,
//           sentiment: summaryData.sentiment || "neutral",
//           confidence_score: summaryData.confidence_score ?? null,
//           escalated: false,
//           full_transcript: session.transcript || [],
//         });
//         await callLog.save();
//         console.log(`[${sessionId}] End-of-call summary saved: ${logId}`);
//       }
//     } catch (err) {
//       console.error(
//         `[${sessionId}] Summary generation/save failed:`,
//         err.message,
//       );
//     }
//   } else {
//     console.log(
//       `[${sessionId}] Closing empty session — skipping recording/summary/save`,
//     );
//   }

//   closeElevenLabsWs(sessionId);
//   try {
//     session.ws.close();
//   } catch {}
//   sessions.delete(sessionId);
//   console.log(`[${sessionId}] Session closed`);
// }

// // ─── Prewarm ──────────────────────────────────────────────────────────────────
// function clearPrewarmState(sessionId) {
//   const state = prewarmStates.get(sessionId);
//   if (!state) return;
//   clearTimeout(state.ttlTimer);
//   prewarmStates.delete(sessionId);
// }

// function startPrewarm(sessionId, eventForwarder) {
//   if (prewarmStates.has(sessionId)) return prewarmStates.get(sessionId).promise;
//   const state = { promise: null, ready: false, failed: false, ttlTimer: null };
//   state.promise = createRealtimeSession(sessionId, eventForwarder, null)
//     .then(() => {
//       state.ready = true;
//     })
//     .catch((err) => {
//       state.failed = true;
//       throw err;
//     });
//   state.ttlTimer = setTimeout(() => {
//     if (!prewarmStates.has(sessionId)) return;
//     clearPrewarmState(sessionId);
//     closeSession(sessionId);
//   }, PREWARM_TTL_MS);
//   prewarmStates.set(sessionId, state);
//   return state.promise;
// }

// // ─── Event Forwarder ──────────────────────────────────────────────────────────
// function buildEventForwarder(socket) {
//   return (event) => {
//     switch (event.type) {
//       case "audio-delta":
//         socket.emit("audio-delta", { delta: event.delta });
//         break;
//       case "clear-audio":
//         socket.emit("audio-clear", {});
//         break;
//       case "transcript-delta":
//         socket.emit("transcript-delta", { delta: event.delta });
//         break;
//       case "transcript-done":
//         socket.emit("transcript-done", { transcript: event.transcript });
//         break;
//       case "user-transcript":
//         socket.emit("user-transcript", { transcript: event.transcript });
//         break;
//       case "speech-started":
//         socket.emit("speech-started", {});
//         break;
//       case "call-logged":
//         socket.emit("call-logged", event.data);
//         break;
//       case "call-summary":
//         socket.emit("call-summary", event.data);
//         break;
//       case "recording-saved":
//         socket.emit("recording-saved", event.data);
//         break;
//       case "mock-booking-created":
//         socket.emit("mock-booking-created", event.data);
//         break;
//       case "error":
//         socket.emit("realtime-error", { error: event.error });
//         break;
//       case "session-closed":
//         socket.emit("session-closed", {});
//         break;
//     }
//   };
// }

// // ─── Socket.IO ────────────────────────────────────────────────────────────────
// io.on("connection", (socket) => {
//   console.log(`Client connected: ${socket.id}`);
//   const forwarder = buildEventForwarder(socket);

//   const prewarmTimer = setTimeout(() => {
//     prewarmTimers.delete(socket.id);
//     startPrewarm(socket.id, forwarder).catch(() => {});
//   }, PREWARM_CONNECT_DELAY_MS);
//   prewarmTimers.set(socket.id, prewarmTimer);

//   // `data.customer` replaces the old flat `carContext` string — full
//   // simulation-customer object (name, vehicle, brand, suburb, lastService,
//   // upgradeScore, scenario, id) so the outbound scenario prompts can branch.
//   socket.on("start-session", async (data) => {
//     const sessionId = socket.id;
//     const customerContext = data?.customer || null;

//     const pendingPrewarm = prewarmTimers.get(sessionId);
//     if (pendingPrewarm) {
//       clearTimeout(pendingPrewarm);
//       prewarmTimers.delete(sessionId);
//     }

//     try {
//       if (customerContext) {
//         clearPrewarmState(sessionId);
//         await closeSession(sessionId);
//         await createRealtimeSession(sessionId, forwarder, customerContext);
//         socket.emit("session-started", { sessionId });
//         triggerGreeting(sessionId);
//         return;
//       }

//       let state = prewarmStates.get(sessionId);
//       if (!state) {
//         await startPrewarm(sessionId, forwarder);
//         state = prewarmStates.get(sessionId);
//       }
//       if (state) {
//         try {
//           await state.promise;
//           if (state.ready) {
//             clearPrewarmState(sessionId);
//             socket.emit("session-started", { sessionId });
//             triggerGreeting(sessionId);
//             return;
//           }
//         } catch {}
//         clearPrewarmState(sessionId);
//       }

//       await createRealtimeSession(sessionId, forwarder, null);
//       socket.emit("session-started", { sessionId });
//       triggerGreeting(sessionId);
//     } catch (err) {
//       console.error(`[${sessionId}] Session start failed:`, err.message);
//       socket.emit("realtime-error", {
//         error: { message: "Failed to connect to AI service" },
//       });
//     }
//   });

//   socket.on("audio-chunk", (data) => {
//     if (data?.audio) sendAudio(socket.id, data.audio);
//   });

//   socket.on("get-transcript", () => {
//     const session = sessions.get(socket.id);
//     socket.emit("transcript-state", { transcript: session?.transcript || [] });
//   });

//   socket.on("end-session", async () => {
//     clearPrewarmState(socket.id);
//     await closeSession(socket.id);
//     socket.emit("session-closed", {});
//   });

//   socket.on("disconnect", async () => {
//     const pendingPrewarm = prewarmTimers.get(socket.id);
//     if (pendingPrewarm) {
//       clearTimeout(pendingPrewarm);
//       prewarmTimers.delete(socket.id);
//     }
//     clearPrewarmState(socket.id);
//     await closeSession(socket.id);
//   });
// });

// // ─── REST Endpoints — Call Logs ────────────────────────────────────────────────
// app.get("/api/call-logs", async (req, res) => {
//   try {
//     const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
//     res.json(logs);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch call logs" });
//   }
// });

// app.get("/api/call-logs/intent/:intent", async (req, res) => {
//   try {
//     const logs = await CallLog.find({ intent_category: req.params.intent })
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(logs);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch call logs" });
//   }
// });

// // CSV export of call logs — for stakeholder review / spreadsheet handoff.
// app.get("/api/call-logs/export-csv", async (req, res) => {
//   try {
//     const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
//     const columns = [
//       "id",
//       "sessionId",
//       "isSimulation",
//       "brand",
//       "caller_name",
//       "caller_phone",
//       "vehicle_interest",
//       "scenario",
//       "intent_category",
//       "outcome",
//       "upgrade_interest_level",
//       "recommended_next_action",
//       "sentiment",
//       "confidence_score",
//       "escalated",
//       "ai_summary",
//       "createdAt",
//     ];
//     const rows = logs.map((l) => ({
//       ...l,
//       objections: undefined,
//       booking: undefined,
//       createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : "",
//     }));
//     const csv = toCsv(rows, columns);
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="pc-call-logs-${Date.now()}.csv"`,
//     );
//     res.send(csv);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to export call logs" });
//   }
// });

// app.get("/api/recordings", (req, res) => {
//   const files = fs
//     .readdirSync(RECORDINGS_DIR)
//     .filter((f) => f.endsWith(".wav"));
//   res.json(
//     files.map((f) => ({
//       filename: f,
//       url: `/recordings/${f}`,
//       size:
//         (fs.statSync(path.join(RECORDINGS_DIR, f)).size / 1024 / 1024).toFixed(
//           2,
//         ) + " MB",
//     })),
//   );
// });

// // app.post("/api/summary", async (req, res) => {
// //   try {
// //     const { transcript } = req.body;
// //     if (!Array.isArray(transcript))
// //       return res.status(400).json({ error: "transcript must be an array" });
// //     const summary = await generateCallSummary(transcript);
// //     res.json(summary);
// //   } catch (err) {
// //     res.status(500).json({ error: "Failed to generate summary" });
// //   }
// // });
// app.post("/api/summary", async (req, res) => {
//   try {
//     const { transcript } = req.body;
//     if (!Array.isArray(transcript))
//       return res.status(400).json({ error: "transcript must be an array" });
//     const summary = await generateCallSummary(transcript);
//     res.json(summary);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to generate summary" });
//   }
// });

// // ─── Session Summary PDF ──────────────────────────────────────────────────────
// // Replaces the old client-side .txt blob download. Takes whatever the
// // Simulation UI already has in memory (selected customer, call duration,
// // call log) and streams back a formatted PDF — no DB lookup required, so it
// // works even for a session that never called save_call_log.
// function formatDurationForPdf(totalSeconds) {
//   const s = Math.max(0, Number(totalSeconds) || 0);
//   const mins = Math.floor(s / 60);
//   const secs = s % 60;
//   return `${mins}:${secs.toString().padStart(2, "0")}`;
// }

// function humanize(value) {
//   if (!value) return "N/A";
//   return String(value)
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// app.post("/api/session-summary/pdf", async (req, res) => {
//   try {
//     const { customer, duration, callLog } = req.body || {};

//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const filename = `voice-session-summary-${Date.now()}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

//     doc.pipe(res);

//     const PAGE_LEFT = doc.page.margins.left;
//     const PAGE_RIGHT = doc.page.width - doc.page.margins.right;

//     // ── Header ──
//     doc
//       .fillColor("#0C1E3C")
//       .fontSize(20)
//       .font("Helvetica-Bold")
//       .text("Patterson Cheney", PAGE_LEFT, doc.y);
//     doc
//       .fillColor("#666666")
//       .fontSize(12)
//       .font("Helvetica")
//       .text("Voice Session Summary", PAGE_LEFT, doc.y + 2);

//     doc.moveDown(0.8);
//     doc
//       .strokeColor("#0C1E3C")
//       .lineWidth(2)
//       .moveTo(PAGE_LEFT, doc.y)
//       .lineTo(PAGE_RIGHT, doc.y)
//       .stroke();
//     doc.moveDown(1);

//     // ── Meta row ──
//     const dateStr = new Date().toLocaleString();
//     doc.fillColor("#000000").fontSize(10).font("Helvetica");
//     doc.text(`Date: ${dateStr}`);
//     doc.text(`Duration: ${formatDurationForPdf(duration)}`);
//     doc.moveDown(1);

//     const sectionHeader = (title) => {
//       doc.fillColor("#0C1E3C").fontSize(13).font("Helvetica-Bold").text(title);
//       doc.moveDown(0.3);
//       doc
//         .strokeColor("#dddddd")
//         .lineWidth(1)
//         .moveTo(PAGE_LEFT, doc.y)
//         .lineTo(PAGE_RIGHT, doc.y)
//         .stroke();
//       doc.moveDown(0.5);
//     };

//     const row = (label, value) => {
//       const labelWidth = 150;
//       const y = doc.y;
//       doc
//         .fillColor("#666666")
//         .fontSize(10)
//         .font("Helvetica-Bold")
//         .text(label, PAGE_LEFT, y, { width: labelWidth, continued: false });
//       doc
//         .fillColor("#000000")
//         .font("Helvetica")
//         .text(value || "N/A", PAGE_LEFT + labelWidth, y, {
//           width: PAGE_RIGHT - PAGE_LEFT - labelWidth,
//         });
//       doc.moveDown(0.4);
//     };

//     // ── Customer Information ──
//     if (customer) {
//       sectionHeader("Customer Information");
//       row("Name", customer.name);
//       row("Vehicle", customer.vehicle);
//       row("Brand", customer.brand);
//       row("Location", customer.suburb);
//       row("Scenario", humanize(customer.scenario));
//       if (customer.lastService) row("Last Service", customer.lastService);
//       doc.moveDown(0.8);
//     }

//     // ── Call Log ──
//     if (callLog) {
//       sectionHeader("Call Log");
//       row("Caller Name", callLog.caller_name);
//       row("Intent", humanize(callLog.intent_category));
//       row("Outcome", humanize(callLog.outcome));
//       row("Sentiment", humanize(callLog.sentiment));
//       if (callLog.upgrade_interest_level)
//         row("Upgrade Interest", humanize(callLog.upgrade_interest_level));
//       if (callLog.recommended_next_action)
//         row("Recommended Next Action", callLog.recommended_next_action);
//       if (callLog.booking_ref) row("Booking Reference", callLog.booking_ref);
//       if (Array.isArray(callLog.objections) && callLog.objections.length)
//         row("Objections", callLog.objections.join(", "));
//       doc.moveDown(0.5);

//       if (callLog.ai_summary) {
//         doc
//           .fillColor("#0C1E3C")
//           .fontSize(11)
//           .font("Helvetica-Bold")
//           .text("AI Summary");
//         doc.moveDown(0.2);
//         doc
//           .fillColor("#333333")
//           .fontSize(10)
//           .font("Helvetica")
//           .text(callLog.ai_summary, PAGE_LEFT, doc.y, {
//             width: PAGE_RIGHT - PAGE_LEFT,
//             align: "left",
//           });
//       }
//     }

//     if (!customer && !callLog) {
//       doc
//         .fillColor("#666666")
//         .fontSize(11)
//         .text("No session data was available to include in this report.");
//     }

//     // ── Footer ──
//     doc
//       .fontSize(8)
//       .fillColor("#999999")
//       .text(
//         "Generated by Patterson Cheney Voice Agent Simulation",
//         PAGE_LEFT,
//         doc.page.height - doc.page.margins.bottom - 15,
//         { align: "center", width: PAGE_RIGHT - PAGE_LEFT },
//       );

//     doc.end();
//   } catch (err) {
//     console.error("Session summary PDF generation failed:", err.message);
//     if (!res.headersSent) {
//       res.status(500).json({ error: "Failed to generate PDF summary" });
//     }
//   }
// });
// // ─── REST Endpoints — Simulation Customers (CSV import/export) ───────────────
// // Test-sheet columns: name,phone,vehicle,brand,suburb,scenario,lastService,upgradeScore
// app.post(
//   "/api/simulation/customers/import-csv",
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file)
//         return res
//           .status(400)
//           .json({ error: "No CSV file uploaded (field name: 'file')" });
//       const text = fs.readFileSync(req.file.path, "utf8");
//       const rows = parseCsv(text);
//       fs.unlink(req.file.path, () => {});

//       if (rows.length === 0)
//         return res.status(400).json({ error: "CSV had no data rows" });

//       const requiredCols = ["name", "vehicle", "brand", "scenario"];
//       const missingCols = requiredCols.filter((c) => !(c in rows[0]));
//       if (missingCols.length) {
//         return res.status(400).json({
//           error: `CSV missing required column(s): ${missingCols.join(", ")}`,
//           expectedColumns: [
//             "name",
//             "phone",
//             "vehicle",
//             "brand",
//             "suburb",
//             "scenario",
//             "lastService",
//             "upgradeScore",
//           ],
//         });
//       }

//       const batchLabel = req.body.batchLabel || `import_${Date.now()}`;
//       const validScenarios = [
//         "service_due",
//         "upgrade_opportunity",
//         "finance_renewal",
//         "objection_handling",
//         "callback_follow_up",
//       ];
//       const validBrands = ["Toyota", "Mercedes-Benz", "Isuzu"];

//       const errors = [];
//       const docs = [];
//       rows.forEach((r, idx) => {
//         const lineNo = idx + 2; // +1 for header, +1 for 1-index
//         if (!r.name || !r.vehicle) {
//           errors.push(`Line ${lineNo}: missing name or vehicle`);
//           return;
//         }
//         if (!validBrands.includes(r.brand)) {
//           errors.push(
//             `Line ${lineNo}: brand must be one of ${validBrands.join(", ")}`,
//           );
//           return;
//         }
//         if (!validScenarios.includes(r.scenario)) {
//           errors.push(
//             `Line ${lineNo}: scenario must be one of ${validScenarios.join(", ")}`,
//           );
//           return;
//         }
//         docs.push({
//           id: uuidv4(),
//           name: r.name,
//           phone: r.phone || null,
//           vehicle: r.vehicle,
//           brand: r.brand,
//           suburb: r.suburb || null,
//           scenario: r.scenario,
//           lastService: r.lastService || null,
//           upgradeScore: r.upgradeScore ? Number(r.upgradeScore) : 3,
//           batchLabel,
//         });
//       });

//       if (docs.length) await SimulationCustomer.insertMany(docs);

//       res.json({
//         imported: docs.length,
//         skipped: errors.length,
//         batchLabel,
//         errors: errors.slice(0, 20), // cap so a bad file doesn't flood the response
//       });
//     } catch (err) {
//       console.error("CSV import failed:", err.message);
//       res.status(500).json({ error: "Failed to import CSV" });
//     }
//   },
// );

// app.get("/api/simulation/customers", async (req, res) => {
//   try {
//     const filter = req.query.batchLabel
//       ? { batchLabel: req.query.batchLabel }
//       : {};
//     const customers = await SimulationCustomer.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(customers);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch simulation customers" });
//   }
// });

// app.get("/api/simulation/customers/export-csv", async (req, res) => {
//   try {
//     const filter = req.query.batchLabel
//       ? { batchLabel: req.query.batchLabel }
//       : {};
//     const customers = await SimulationCustomer.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();
//     const columns = [
//       "name",
//       "phone",
//       "vehicle",
//       "brand",
//       "suburb",
//       "scenario",
//       "lastService",
//       "upgradeScore",
//       "batchLabel",
//     ];
//     const csv = toCsv(customers, columns);
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="pc-simulation-customers-${Date.now()}.csv"`,
//     );
//     res.send(csv);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to export simulation customers" });
//   }
// });

// app.delete("/api/simulation/customers/:id", async (req, res) => {
//   try {
//     await SimulationCustomer.deleteOne({ id: req.params.id });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete customer" });
//   }
// });

// // Downloadable CSV template so stakeholders know the exact expected columns.
// app.get("/api/simulation/customers/template-csv", (req, res) => {
//   const csv = toCsv(
//     [
//       {
//         name: "James Nguyen",
//         phone: "0400000001",
//         vehicle: "2021 Toyota HiLux SR5",
//         brand: "Toyota",
//         suburb: "Keysborough",
//         scenario: "service_due",
//         lastService: "2025-10-20",
//         upgradeScore: 5,
//       },
//       {
//         name: "Sarah Thompson",
//         phone: "0400000002",
//         vehicle: "2022 Mercedes GLC 300",
//         brand: "Mercedes-Benz",
//         suburb: "Berwick",
//         scenario: "upgrade_opportunity",
//         lastService: "2025-09-10",
//         upgradeScore: 4,
//       },
//     ],
//     [
//       "name",
//       "phone",
//       "vehicle",
//       "brand",
//       "suburb",
//       "scenario",
//       "lastService",
//       "upgradeScore",
//     ],
//   );
//   res.setHeader("Content-Type", "text/csv");
//   res.setHeader(
//     "Content-Disposition",
//     'attachment; filename="pc-simulation-customer-template.csv"',
//   );
//   res.send(csv);
// });

// // ─── REST Endpoints — Mock Booking Calendar ───────────────────────────────────
// app.get("/api/mock-bookings", async (req, res) => {
//   try {
//     const bookings = await MockBooking.find().sort({ date: 1, time: 1 }).lean();
//     res.json(bookings);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch mock bookings" });
//   }
// });

// // Manual create — lets the Simulation UI's calendar picker book a slot
// // directly (outside of a live agent call), matching the requirement:
// // "Mock booking calendar & confirmation UI that writes fake booking ref back."
// app.post("/api/mock-bookings", async (req, res) => {
//   try {
//     const { customer_name, phone, vehicle, brand, type, date, time, notes } =
//       req.body;
//     if (!customer_name || !type || !date || !time) {
//       return res
//         .status(400)
//         .json({ error: "customer_name, type, date, time are required" });
//     }
//     const booking = await createMockBooking({
//       customer_name,
//       phone,
//       vehicle,
//       brand,
//       type,
//       date,
//       time,
//       notes,
//     });
//     res.json(booking);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create mock booking" });
//   }
// });

// app.post("/api/mock-bookings/:id/cancel", async (req, res) => {
//   try {
//     const booking = await MockBooking.findOneAndUpdate(
//       { id: req.params.id },
//       { $set: { status: "cancelled" } },
//       { new: true },
//     );
//     if (!booking) return res.status(404).json({ error: "Booking not found" });
//     res.json(booking);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to cancel booking" });
//   }
// });

// app.get("/api/health", (req, res) =>
//   res.json({ status: "ok", sessions: sessions.size }),
// );

// // ─── Start ────────────────────────────────────────────────────────────────────
// server.listen(PORT, () => {
//   console.log(`
// ╔══════════════════════════════════════════════════════════════╗
// ║   Patterson Cheney — AI Voice Agent (Simulation/Vetting Mode) ║
// ║   Running on http://localhost:${PORT}                         ║
// ║                                                              ║
// ║   Model:          ${OPENAI_REALTIME_MODEL}                   ║
// ║   Summary Model:  ${OPENAI_SUMMARY_MODEL}                    ║
// ║   OpenAI API Key: ${OPENAI_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// ║   ElevenLabs Key: ${ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
// ║   Voice ID:       ${ELEVENLABS_VOICE_ID}                     ║
// ║   MongoDB:        ${MONGODB_URI ? "✓ Set" : "✗ Missing"}                             ║
// ╚══════════════════════════════════════════════════════════════╝
//   `);
// });

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit"); // NEW — for the session summary PDF endpoint

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = process.env.PC_VOICE_PORT || 4051;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
const MONGODB_URI = process.env.MONGODB_URI;
const PREWARM_TTL_MS = 60_000;
const PREWARM_CONNECT_DELAY_MS = 400;

const OPENAI_REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini";
const OPENAI_INPUT_SAMPLE_RATE = Number(
  process.env.OPENAI_INPUT_SAMPLE_RATE || 24000,
);

const OPENAI_VAD_THRESHOLD = Number(process.env.OPENAI_VAD_THRESHOLD || 0.5);
const OPENAI_VAD_PREFIX_PADDING_MS = Number(
  process.env.OPENAI_VAD_PREFIX_PADDING_MS || 300,
);
const OPENAI_VAD_SILENCE_DURATION_MS = Number(
  process.env.OPENAI_VAD_SILENCE_DURATION_MS || 500,
);

// KNOWN GAP (flagged, not solved by this file — see GAP_ANALYSIS.md):
// This server drives audio over a browser WebSocket (socket.io) via OpenAI
// Realtime + ElevenLabs. That is correct for the Simulation/Vetting sandbox
// (text + voice preview in-browser, per the requirements doc). It is NOT a
// PSTN/outbound dialer. A real "call James Nguyen's mobile" pilot needs a
// telephony leg (Twilio Programmable Voice / SIP trunk, or a platform like
// Retell/Vapi that already bridges realtime LLM audio to PSTN + warm SIP
// transfer). Wire that in as a separate `telephony.js` adapter that feeds
// the same createRealtimeSession()/handleRealtimeEvent() pipeline.

// ─── MongoDB Connection ───────────────────────────────────────────────────────
if (!MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI not set — call logs will NOT be saved.");
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅  MongoDB connected"))
    .catch((err) => console.error("❌  MongoDB error:", err.message));
}

// ─── Call Log Schema ──────────────────────────────────────────────────────────
// Extended per requirements: "LLM post-processing extracts: outcome
// category, booking details (date/time/vehicle), upgrade interest level,
// key objections/notes, sentiment, recommended next action."
const callLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true },
    isSimulation: { type: Boolean, default: true }, // simulation vs live pilot call
    customerId: { type: String, default: null }, // links back to SimulationCustomer.id
    brand: {
      type: String,
      enum: ["Toyota", "Mercedes-Benz", "Isuzu", null],
      default: null,
    },
    caller_name: { type: String, default: null },
    caller_phone: { type: String, default: null },
    caller_email: { type: String, default: null },
    vehicle_interest: { type: String, default: null },

    scenario: {
      type: String,
      enum: [
        "service_due",
        "upgrade_opportunity",
        "finance_renewal",
        "objection_handling",
        "callback_follow_up",
        null,
      ],
      default: null,
    },

    intent_category: {
      type: String,
      enum: [
        "service_booking",
        "upgrade_qualification",
        "finance_renewal_inquiry",
        "objection_handling",
        "faq",
        "staff_transfer",
        "callback_follow_up",
        "no_transcript_admin",
      ],
      required: true,
    },

    outcome: {
      type: String,
      enum: [
        "service_booked",
        "callback_scheduled",
        "transferred_to_human",
        "info_provided",
        "test_drive_booked",
        "declined",
        "message_taken",
        "escalated",
        "no_answer",
      ],
      required: true,
    },

    // Booking details (service or test drive) — mirrors the mock booking
    // write-back so the transcript, the tool call, and the calendar UI agree.
    booking: {
      date: { type: String, default: null }, // e.g. "2026-07-14"
      time: { type: String, default: null }, // e.g. "10:30am"
      type: {
        type: String,
        enum: ["service", "test_drive", null],
        default: null,
      },
      booking_ref: { type: String, default: null },
    },

    upgrade_interest_level: {
      type: String,
      enum: ["none", "low", "medium", "high", null],
      default: null,
    },
    objections: { type: [String], default: [] },
    recommended_next_action: { type: String, default: null },

    ai_summary: { type: String, default: null },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    confidence_score: { type: Number, default: null },
    escalated: { type: Boolean, default: false },
    full_transcript: { type: Array, default: [] },
  },
  { timestamps: true },
);

const CallLog = mongoose.model("PCCallLog", callLogSchema);

// ─── Simulation Customer Schema (replaces "Google Sheet" test-sheet import) ───
// Requirements doc says "upload test sheet (Google Sheet)". Implemented here
// as CSV import/export instead, per instruction — no external OAuth/Sheets
// API dependency, works with any spreadsheet tool via CSV.
const simulationCustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, default: null }, // synthetic/internal test number
    vehicle: { type: String, required: true },
    brand: {
      type: String,
      enum: ["Toyota", "Mercedes-Benz", "Isuzu"],
      required: true,
    },
    suburb: { type: String, default: null },
    scenario: {
      type: String,
      enum: [
        "service_due",
        "upgrade_opportunity",
        "finance_renewal",
        "objection_handling",
        "callback_follow_up",
      ],
      required: true,
    },
    lastService: { type: String, default: null },
    upgradeScore: { type: Number, default: 3 },
    batchLabel: { type: String, default: null }, // groups rows from one CSV upload
  },
  { timestamps: true },
);

const SimulationCustomer = mongoose.model(
  "PCSimulationCustomer",
  simulationCustomerSchema,
);

// ─── Mock Booking Schema ───────────────────────────────────────────────────────
// Requirements doc: "Mock booking calendar & confirmation UI that writes
// fake booking ref back." This is the write-back store for that UI.
const mockBookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    booking_ref: { type: String, required: true, unique: true },
    sessionId: { type: String, default: null },
    customer_name: { type: String, required: true },
    phone: { type: String, default: null },
    vehicle: { type: String, default: null },
    brand: { type: String, default: null },
    type: { type: String, enum: ["service", "test_drive"], required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

const MockBooking = mongoose.model("PCMockBooking", mockBookingSchema);

// ─── Recordings directory ─────────────────────────────────────────────────────
const RECORDINGS_DIR = path.join(__dirname, "recordings");
if (!fs.existsSync(RECORDINGS_DIR))
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Express + Socket.IO ──────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const upload = multer({ dest: UPLOADS_DIR });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/recordings", express.static(RECORDINGS_DIR));

// ─── Session State ────────────────────────────────────────────────────────────
const sessions = new Map();
const prewarmStates = new Map();
const prewarmTimers = new Map();

// ─── Dealership Knowledge Base ─────────────────────────────────────────────────
// Replaces the BYD single-brand product catalogue with the Patterson Cheney
// multi-franchise knowledge the outbound agent actually needs: dealer
// policy, service/finance/trade-in facts, and objection-handling material.
// Model-specific facts (the customer's own car) come from CONTEXT INJECTION
// per call (name, vehicle, brand, suburb, lastService, upgradeScore,
// scenario) — NOT hardcoded here, since every call is about a different car.
const PC_KNOWLEDGE_SUMMARY = `
PATTERSON CHENEY — DEALERSHIP GROUP FACTS:

FRANCHISES:
- Toyota (Keysborough) — passenger, SUV, HiLux/LandCruiser commercial range
- Mercedes-Benz (Berwick / Brighton) — passenger cars, SUVs, AMG performance
- Isuzu UTE (Dandenong) — D-MAX, MU-X

SERVICE:
- Standard scheduled service booking, capped-price servicing on eligible models
- Loan car / shuttle service available on request, subject to availability
- Typical service bay slots: weekday mornings (8–10am) and early afternoon (1–3pm) tend to have the most availability
- Reminder SMS + calendar invite sent automatically once a booking is confirmed

FINANCE / TRADE-IN:
- Trade-in valuations available same-day, obligation-free
- Finance renewal: team can review current term and quote new finance/lease options near term-end
- Cannot quote exact finance rates or trade-in dollar figures on the call — always hand to a consultant for a firm number

WARRANTY / OWNERSHIP:
- New vehicle warranty terms vary by franchise (Toyota/Mercedes-Benz/Isuzu) — confirm with a consultant if asked for exact years/km, don't guess

COMPLIANCE:
- Every call opens with a recording disclosure
- Never quote a firm price, interest rate, or trade-in value — that's a "connect you with a consultant" moment, not a number you state yourself
`.trim();

const SCENARIO_GUIDANCE = {
  service_due: {
    goal: "service_booking",
    opener:
      "You're calling because their vehicle is due, or coming up due, for scheduled maintenance. Confirm the last service date, explain it's time to book, and offer 2–3 concrete slots.",
  },
  upgrade_opportunity: {
    goal: "upgrade_qualification",
    opener:
      "You're calling a high-value owner about trade-in/upgrade opportunities. Lead with genuine interest in their current car, then gauge appetite for upgrading in the next 6–12 months.",
  },
  finance_renewal: {
    goal: "finance_renewal_inquiry",
    opener:
      "Their finance term is ending soon. You're calling to flag that and see if they want the team to prepare renewal or new-finance options.",
  },
  objection_handling: {
    goal: "objection_handling",
    opener:
      "This call is a practice/QA run focused on objection handling — expect pushback (too busy, too expensive, bad past experience, not interested). Stay calm, acknowledge, and offer a low-commitment next step.",
  },
  callback_follow_up: {
    goal: "callback_follow_up",
    opener:
      "You're following up on a previous inquiry or a callback the customer requested. Reference that briefly and pick the conversation back up.",
  },
};

// ─── System Prompt ────────────────────────────────────────────────────────────
// Restructured for the OUTBOUND flow described in the requirements doc:
// Opening & Verification -> Context Setting (service or upgrade) ->
// Objection Handling / FAQ -> Warm Transfer if needed -> Close & Log.
function getSystemPrompt(customerContext) {
  const scenario = customerContext?.scenario
    ? SCENARIO_GUIDANCE[customerContext.scenario]
    : null;

  const contextBlock = customerContext
    ? `
=============================================================
ACTIVE CALL CONTEXT — THIS CALL IS ABOUT THIS CUSTOMER ONLY
=============================================================
Customer name: ${customerContext.name || "unknown — verify at open"}
Vehicle: ${customerContext.vehicle || "unknown"}
Franchise: ${customerContext.brand || "unknown"}
Suburb: ${customerContext.suburb || "unknown"}
Last service: ${customerContext.lastService || "unknown"}
Upgrade propensity score (1-5, internal only, never say this number aloud): ${customerContext.upgradeScore ?? "n/a"}
Call scenario: ${customerContext.scenario || "general"}
${scenario ? `Primary goal this call: ${scenario.goal}\nApproach: ${scenario.opener}` : ""}
=============================================================
`
    : `
No customer context was supplied for this call — treat it as a general
inbound/test call. Ask for the customer's name and vehicle before doing
anything else.
`;

  return `
=============================================================
ABSOLUTE RULE — ENGLISH ONLY. THIS OVERRIDES EVERYTHING.
=============================================================
You MUST respond in English only. If the caller speaks another language,
say: "Sorry, I can only assist in English at the moment."
=============================================================

### IDENTITY ###
You are Aria, the AI voice agent for Patterson Cheney, an Australian multi-franchise
dealership group representing Toyota, Mercedes-Benz, and Isuzu UTE. You place
OUTBOUND calls to existing customers — service reminders, upgrade/trade-in
check-ins, finance renewal check-ins, and callback follow-ups. You are not a
generic call-centre bot — you sound like a warm, switched-on Australian
dealership rep who already knows who they're calling and why.
${contextBlock}
### AI / RECORDING DISCLOSURE — COMPLIANCE, NOT OPTIONAL ###
- Every call MUST open by identifying yourself and disclosing the call may
  be recorded, e.g.: "Hi, this is Aria calling from Patterson Cheney
  ${customerContext?.brand ? customerContext.brand : ""} — just so you know,
  this call may be recorded for quality purposes."
- Do NOT otherwise volunteer that you are AI.
- ONLY if explicitly asked "are you a robot / AI / real person?" — be honest:
  "Good question — I'm actually an AI assistant helping the Patterson Cheney
  team reach out about your vehicle. I can help book that in or answer
  questions — how can I help?"
- Pivot straight back to the call's purpose.

### PERSONALITY ###
- Friendly, warm Australian manner — this is a relationship call, not a cold sales pitch
- Genuinely interested in the customer's current car and situation
- Never pushy — consultative, especially on the upgrade/finance angle
- Natural fillers: "absolutely", "no worries", "good to hear", "for sure"
- Match caller energy: relaxed with relaxed callers, efficient with busy ones
- If the customer says now is a bad time, offer to call back at a better time and end warmly — do not push on

### HOW YOU TALK ###
- SHORT responses — 1 to 2 sentences max
- Contractions: "what's", "we've", "I'll", "you're", "that's"
- ACKNOWLEDGE first, then respond
- ONE question at a time — never stack questions
- Silence/can't hear: "Still there?" or "Sorry, didn't catch that — could you say that again?"

### DEALERSHIP KNOWLEDGE ###
${PC_KNOWLEDGE_SUMMARY}

=============================================================
CALL FLOW
=============================================================

STEP 01 — OPENING & VERIFICATION
"Hi, is this ${customerContext?.name || "[customer name]"}? ... Hi ${customerContext?.name ? customerContext.name.split(" ")[0] : "[name]"}, this is Aria calling from Patterson Cheney ${customerContext?.brand || ""} — just so you know this call may be recorded for quality purposes. Is now an okay time for a quick chat?"
If they say it's a bad time: offer a callback time, thank them, end the call, and still call save_call_log with outcome "callback_scheduled".

STEP 02 — CONTEXT SETTING (scenario-specific)
${
  scenario
    ? `Goal: ${scenario.goal}. ${scenario.opener}`
    : "Establish why you're calling based on their situation, then move to a clear ask."
}

For SERVICE DUE:
"Our records show your ${customerContext?.vehicle || "[vehicle]"} was last serviced on ${customerContext?.lastService || "[date]"}, so it's coming up due for its next scheduled maintenance. Keen to lock that in?"
Offer 2–3 concrete slots (see service knowledge above for realistic windows), or capture a preferred day/time window.
Handle objections (cost, timing, transport) — acknowledge, then offer the loan car/shuttle info or a more convenient slot.

For UPGRADE OPPORTUNITY:
"While I've got you — a lot of ${customerContext?.vehicle || "your model"} owners are taking advantage of current trade-in values on the newer range. Is that something you've thought about in the next 6 to 12 months?"
Qualify budget/timeline/must-have features lightly. If warm, offer to book a test drive or transfer to a sales consultant. If cold, thank them and close politely — don't push.

For FINANCE RENEWAL:
Flag that their finance term is ending soon and ask if they'd like the team to prepare renewal/new options. Never quote a rate — offer to have a consultant call with real numbers.

For OBJECTION HANDLING (practice scenario):
Expect pushback. Acknowledge the objection in one sentence, offer a genuinely lower-commitment next step (e.g. "no pressure at all — can I just pencil in a callback for next week instead?"), and don't argue.

STEP 03 — BOOKING (when the customer agrees to a slot)
Collect, one at a time: which vehicle/service, preferred date, preferred time, best contact number.
Once confirmed, treat the slot as booked in this conversation and include it as
"booking": { "date", "time", "type": "service" or "test_drive" } in save_call_log —
the platform will generate the confirmation and booking reference from that.
Tell the customer: "Great, you're locked in for [date] at [time] — you'll get an SMS confirmation and calendar invite shortly."

STEP 04 — WARM TRANSFER
Trigger for: firm finance/trade-in numbers, complaints/disputes, complex negotiation, or the customer directly asking for a person.
Say: "I want to make sure you get the right numbers on this — let me get one of our consultants to give you a call. Just confirming, is ${customerContext?.name || "this"} still the best number to reach you on?"
Set outcome to "transferred_to_human" and escalated: true.

STEP 05 — CLOSE
Never end passively. Confirm next step out loud, thank them by name, end warmly.

=============================================================
STEP 06 — SAVE CALL LOG (MANDATORY after every completed call)
=============================================================
After every call where purpose was established, call save_call_log with as
much of the structured detail as you actually gathered — don't guess. This
is the ONLY source for outcome category, booking details, upgrade interest
level, objections, sentiment, and recommended next action, so be accurate
and specific rather than generic.

=============================================================
HARD RULES
=============================================================
- ENGLISH ONLY
- Open every call with the recording disclosure
- ONE question at a time
- 1–2 sentences max per response
- NEVER assume caller's name — verify it
- NEVER state a firm price, interest rate, or trade-in dollar value — hand that to a consultant
- ALWAYS call save_call_log after every completed call
`.trim();
}

// ─── Tool Definition ──────────────────────────────────────────────────────────
function getSaveCallLogTool() {
  return {
    type: "function",
    name: "save_call_log",
    description:
      "Saves a structured call log after every completed Patterson Cheney outbound call. MUST be called once the call reaches a natural conclusion (booked, declined, transferred, callback, or no engagement).",
    parameters: {
      type: "object",
      properties: {
        caller_name: {
          type: "string",
          description: "Full name of the customer",
        },
        caller_phone: { type: "string", description: "Best contact number" },
        caller_email: {
          type: "string",
          description: "Customer email if given",
        },
        vehicle_interest: {
          type: "string",
          description: "Vehicle discussed, e.g. '2021 Toyota HiLux SR5'",
        },
        intent_category: {
          type: "string",
          enum: [
            "service_booking",
            "upgrade_qualification",
            "finance_renewal_inquiry",
            "objection_handling",
            "faq",
            "staff_transfer",
            "callback_follow_up",
            "no_transcript_admin",
          ],
        },
        outcome: {
          type: "string",
          enum: [
            "service_booked",
            "callback_scheduled",
            "transferred_to_human",
            "info_provided",
            "test_drive_booked",
            "declined",
            "message_taken",
            "escalated",
            "no_answer",
          ],
        },
        booking: {
          type: "object",
          description: "Only include if a slot was actually agreed on the call",
          properties: {
            date: { type: "string", description: "e.g. '2026-07-14'" },
            time: { type: "string", description: "e.g. '10:30am'" },
            type: { type: "string", enum: ["service", "test_drive"] },
          },
        },
        upgrade_interest_level: {
          type: "string",
          enum: ["none", "low", "medium", "high"],
        },
        objections: {
          type: "array",
          items: { type: "string" },
          description:
            "Key objections raised, e.g. ['too expensive', 'no time']",
        },
        recommended_next_action: {
          type: "string",
          description:
            "One sentence: what should staff do next with this customer",
        },
        ai_summary: {
          type: "string",
          description: "2-3 sentence summary of the call",
        },
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative"],
        },
        confidence_score: { type: "number", description: "0.0 to 1.0" },
        escalated: { type: "boolean" },
      },
      required: ["caller_name", "intent_category", "outcome"],
    },
  };
}

// ─── Recording (WAV builder) — unchanged from base implementation ─────────────
class ConversationRecorder {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.userChunks = [];
    this.agentChunks = [];
    this.startTime = Date.now();
    this.events = [];
  }
  addUserAudio(base64Pcm16) {
    const buf = Buffer.from(base64Pcm16, "base64");
    this.userChunks.push(buf);
    this.events.push({
      type: "user",
      time: Date.now() - this.startTime,
      bytes: buf.length,
    });
  }
  addAgentAudio(base64Pcm16) {
    const buf = Buffer.from(base64Pcm16, "base64");
    this.agentChunks.push(buf);
    this.events.push({
      type: "agent",
      time: Date.now() - this.startTime,
      bytes: buf.length,
    });
  }
  _resample(pcmBuffer, srcRate, dstRate) {
    if (srcRate === dstRate) return pcmBuffer;
    const srcSamples = pcmBuffer.length / 2;
    const ratio = srcRate / dstRate;
    const dstSamples = Math.floor(srcSamples / ratio);
    const out = Buffer.alloc(dstSamples * 2);
    for (let i = 0; i < dstSamples; i++) {
      const srcIdx = i * ratio;
      const lo = Math.floor(srcIdx);
      const hi = Math.min(lo + 1, srcSamples - 1);
      const frac = srcIdx - lo;
      const sLo = pcmBuffer.readInt16LE(lo * 2);
      const sHi = pcmBuffer.readInt16LE(hi * 2);
      const val = Math.round(sLo + (sHi - sLo) * frac);
      out.writeInt16LE(Math.max(-32768, Math.min(32767, val)), i * 2);
    }
    return out;
  }
  saveToFile() {
    const OUTPUT_RATE = 24000;
    const userPcm = Buffer.concat(this.userChunks);
    const agentPcm = this._resample(
      Buffer.concat(this.agentChunks),
      16000,
      OUTPUT_RATE,
    );
    const totalSamples = Math.max(userPcm.length / 2, agentPcm.length / 2);
    const mixed = Buffer.alloc(totalSamples * 2);
    for (let i = 0; i < totalSamples; i++) {
      let v = 0;
      if (i < userPcm.length / 2) v += userPcm.readInt16LE(i * 2);
      if (i < agentPcm.length / 2) v += agentPcm.readInt16LE(i * 2);
      mixed.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
    }
    const hdr = Buffer.alloc(44);
    const dataSize = mixed.length;
    hdr.write("RIFF", 0);
    hdr.writeUInt32LE(36 + dataSize, 4);
    hdr.write("WAVE", 8);
    hdr.write("fmt ", 12);
    hdr.writeUInt32LE(16, 16);
    hdr.writeUInt16LE(1, 20);
    hdr.writeUInt16LE(1, 22);
    hdr.writeUInt32LE(OUTPUT_RATE, 24);
    hdr.writeUInt32LE(OUTPUT_RATE * 2, 28);
    hdr.writeUInt16LE(2, 32);
    hdr.writeUInt16LE(16, 34);
    hdr.write("data", 36);
    hdr.writeUInt32LE(dataSize, 40);
    const wav = Buffer.concat([hdr, mixed]);
    const filename = `pc_call_${this.sessionId}_${Date.now()}.wav`;
    const filepath = path.join(RECORDINGS_DIR, filename);
    fs.writeFileSync(filepath, wav);
    console.log(
      `[Recording] Saved: ${filename} (${(wav.length / 1024 / 1024).toFixed(2)} MB)`,
    );
    return {
      filename,
      filepath,
      sizeMB: (wav.length / 1024 / 1024).toFixed(2),
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sendWsJson(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  ws.send(JSON.stringify(payload));
  return true;
}

function toFunctionCallPayload(value) {
  if (!value || typeof value !== "object") return null;
  if (
    (value.type === "function_call" || true) &&
    typeof value.name === "string" &&
    typeof value.arguments === "string" &&
    typeof value.call_id === "string"
  ) {
    return {
      name: value.name,
      arguments: value.arguments,
      call_id: value.call_id,
    };
  }
  return null;
}

function extractFunctionCallsFromResponse(response) {
  const calls = [];
  const output = response?.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const fc = toFunctionCallPayload(item);
      if (fc) calls.push(fc);
    }
  }
  return calls;
}

// ─── CSV helpers (replaces "Google Sheet" test-sheet import/export) ──────────
// Minimal dependency-free CSV parser/writer — good enough for the flat,
// comma-separated test-sheet schema this feature needs. Handles quoted
// fields containing commas.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") pushField();
      else if (c === "\n") {
        pushField();
        pushRow();
      } else if (c === "\r") {
        /* skip */
      } else field += c;
    }
  }
  if (field.length || row.length) {
    pushField();
    pushRow();
  }

  const filtered = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (filtered.length === 0) return [];
  const headers = filtered[0].map((h) => h.trim());
  return filtered.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] || "").trim();
    });
    return obj;
  });
}

function toCsvValue(val) {
  const s = val === null || val === undefined ? "" : String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows, columns) {
  const header = columns.join(",");
  const lines = rows.map((r) => columns.map((c) => toCsvValue(r[c])).join(","));
  return [header, ...lines].join("\n");
}

// ─── End-of-call summary generator ────────────────────────────────────────────
async function generateCallSummary(transcriptArray) {
  if (!transcriptArray || transcriptArray.length === 0) {
    return {
      summary: "No conversation took place.",
      sentiment: "neutral",
      intent_category: "no_transcript_admin",
      outcome: "no_answer",
      caller_name: null,
      vehicle_interest: null,
      upgrade_interest_level: "none",
      objections: [],
      recommended_next_action: "Retry the call at a different time.",
      confidence_score: 0,
    };
  }

  const conversationText = transcriptArray
    .map((t) => `${t.role === "user" ? "Customer" : "Agent"}: ${t.text}`)
    .join("\n");

  const prompt = `You are summarizing a phone call transcript from a Patterson Cheney dealership outbound voice agent call (service reminders / upgrade qualification / finance renewal / objection handling / callback follow-up).

TRANSCRIPT:
${conversationText}

Return ONLY a JSON object (no markdown, no preamble) with these fields:
{
  "summary": "2-3 sentence summary of what happened on the call",
  "sentiment": "positive" | "neutral" | "negative",
  "intent_category": one of ["service_booking","upgrade_qualification","finance_renewal_inquiry","objection_handling","faq","staff_transfer","callback_follow_up","no_transcript_admin"],
  "outcome": one of ["service_booked","callback_scheduled","transferred_to_human","info_provided","test_drive_booked","declined","message_taken","escalated","no_answer"],
  "caller_name": "name if mentioned, else null",
  "vehicle_interest": "vehicle model if mentioned, else null",
  "booking": { "date": "date if a slot was agreed, else null", "time": "time if agreed, else null", "type": "'service' or 'test_drive' or null" },
  "upgrade_interest_level": "none" | "low" | "medium" | "high",
  "objections": ["short phrases for each objection raised, empty array if none"],
  "recommended_next_action": "one sentence: what staff should do next with this customer",
  "confidence_score": number between 0 and 1
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_SUMMARY_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("No content returned from summary model");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Summary generation failed:", err.message);
    return {
      summary: "Summary generation failed.",
      sentiment: "neutral",
      intent_category: "no_transcript_admin",
      outcome: "message_taken",
      caller_name: null,
      vehicle_interest: null,
      upgrade_interest_level: "none",
      objections: [],
      recommended_next_action: null,
      confidence_score: 0,
    };
  }
}

// ─── OpenAI Realtime Session ──────────────────────────────────────────────────
function createRealtimeSession(sessionId, onEvent, customerContext) {
  const url = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
  const startMs = Date.now();

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    });

    ws.on("open", () => {
      console.log(
        `[${sessionId}] OpenAI Realtime connected (${Date.now() - startMs}ms)${customerContext ? ` | Customer: ${customerContext.name} / ${customerContext.vehicle}` : ""}`,
      );

      sendWsJson(ws, {
        type: "session.update",
        session: {
          type: "realtime",
          model: OPENAI_REALTIME_MODEL,
          output_modalities: ["text"],
          audio: {
            input: {
              format: { type: "audio/pcm", rate: OPENAI_INPUT_SAMPLE_RATE },
              turn_detection: {
                type: "server_vad",
                threshold: OPENAI_VAD_THRESHOLD,
                prefix_padding_ms: OPENAI_VAD_PREFIX_PADDING_MS,
                silence_duration_ms: OPENAI_VAD_SILENCE_DURATION_MS,
              },
            },
          },
          instructions: getSystemPrompt(customerContext || null),
          tools: [getSaveCallLogTool()],
          tool_choice: "auto",
        },
      });

      const session = {
        ws,
        customerContext: customerContext || null,
        elevenLabsWs: null,
        elevenLabsReady: false,
        textBuffer: [],
        isResponseActive: false,
        onEvent,
        startMs,
        openAiConnectedMs: Date.now(),
        elevenLabsConnectedMs: null,
        greetingTriggeredMs: null,
        firstResponseCreatedMs: null,
        firstAudioDeltaLogged: false,
        processedCallIds: new Set(),
        recorder: new ConversationRecorder(sessionId),
        callLogs: [],
        elevenLabsOpening: false,
        transcript: [],
        currentAssistantText: "",
      };

      sessions.set(sessionId, session);
      openElevenLabsStream(sessionId);
      resolve();
    });

    ws.on("message", async (data) => {
      try {
        const event = JSON.parse(data.toString());
        await handleRealtimeEvent(sessionId, event);
      } catch (err) {
        console.error(`[${sessionId}] Parse error:`, err.message);
      }
    });

    ws.on("error", (err) => {
      console.error(`[${sessionId}] OpenAI WS error:`, err.message);
      onEvent({ type: "error", error: { message: err.message } });
      reject(err);
    });

    ws.on("close", (code) => {
      console.log(`[${sessionId}] OpenAI WS closed: ${code}`);
      closeElevenLabsWs(sessionId);
      sessions.delete(sessionId);
      onEvent({ type: "session-closed" });
    });
  });
}

// ─── Audio helpers ────────────────────────────────────────────────────────────
function sendAudio(sessionId, base64Audio) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.recorder.addUserAudio(base64Audio);
  sendWsJson(session.ws, {
    type: "input_audio_buffer.append",
    audio: base64Audio,
  });
}

// ─── Trigger greeting — customer-context-aware ────────────────────────────────
function triggerGreeting(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.greetingTriggeredMs = Date.now();

  if (session.customerContext) {
    const ctx = session.customerContext;
    const primeMessage =
      `This is a simulated OUTBOUND call. You are calling ${ctx.name}, who owns a ` +
      `${ctx.vehicle}. Scenario: ${ctx.scenario || "general"}. Open with the ` +
      `mandatory recording disclosure, verify you're speaking with ${ctx.name}, ` +
      `then move into the call purpose for this scenario.`;

    sendWsJson(session.ws, {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: primeMessage }],
      },
    });
  }

  sendWsJson(session.ws, { type: "response.create" });
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────
function _openNewElevenLabsStream(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  if (session.elevenLabsOpening) return;
  session.elevenLabsOpening = true;

  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream-input?model_id=eleven_multilingual_v2&output_format=pcm_16000`;
  const elWs = new WebSocket(wsUrl);

  elWs.on("open", () => {
    if (!sessions.has(sessionId) || session.elevenLabsWs !== elWs) {
      elWs.close();
      return;
    }
    session.elevenLabsConnectedMs = Date.now();
    session.elevenLabsOpening = false;
    elWs.send(
      JSON.stringify({
        text: " ",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
        xi_api_key: ELEVENLABS_API_KEY,
      }),
    );
    session.elevenLabsReady = true;
    for (const text of session.textBuffer) {
      if (elWs.readyState === WebSocket.OPEN)
        elWs.send(JSON.stringify({ text, try_trigger_generation: true }));
    }
    session.textBuffer = [];
  });

  elWs.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.audio) {
        session.recorder.addAgentAudio(msg.audio);
        session.onEvent({ type: "audio-delta", delta: msg.audio });
      }
    } catch {}
  });

  elWs.on("error", (err) => {
    console.warn(`[${sessionId}] ElevenLabs error: ${err.message}`);
    session.elevenLabsOpening = false;
  });

  elWs.on("close", () => {
    if (session.elevenLabsWs === elWs) {
      session.elevenLabsReady = false;
      session.elevenLabsOpening = false;
    }
  });

  session.elevenLabsWs = elWs;
}

function openElevenLabsStream(sessionId, force = false) {
  const session = sessions.get(sessionId);
  if (!session) return;
  const oldWs = session.elevenLabsWs;

  if (!force) {
    if (
      oldWs &&
      (oldWs.readyState === WebSocket.OPEN ||
        oldWs.readyState === WebSocket.CONNECTING)
    )
      return;
    _openNewElevenLabsStream(sessionId);
    return;
  }

  session.textBuffer = [];
  session.elevenLabsReady = false;

  if (
    !oldWs ||
    oldWs.readyState === WebSocket.CLOSED ||
    oldWs.readyState === WebSocket.CLOSING
  ) {
    session.elevenLabsWs = null;
    session.elevenLabsOpening = false;
    _openNewElevenLabsStream(sessionId);
    return;
  }

  if (oldWs.readyState === WebSocket.CONNECTING) {
    session.elevenLabsWs = null;
    session.elevenLabsOpening = false;
    try {
      oldWs.terminate();
    } catch (_) {}
    _openNewElevenLabsStream(sessionId);
    return;
  }

  session.elevenLabsWs = null;
  session.elevenLabsOpening = false;
  try {
    oldWs.send(JSON.stringify({ text: "" }));
  } catch (_) {}

  oldWs.once("close", () => {
    if (!sessions.has(sessionId)) return;
    const s = sessions.get(sessionId);
    if (s && !s.elevenLabsWs && !s.elevenLabsOpening)
      _openNewElevenLabsStream(sessionId);
  });

  setTimeout(() => {
    if (!sessions.has(sessionId)) return;
    const s = sessions.get(sessionId);
    if (s && !s.elevenLabsWs && !s.elevenLabsOpening)
      _openNewElevenLabsStream(sessionId);
  }, 800);

  try {
    oldWs.close();
  } catch (_) {}
}

function sendTextToElevenLabs(sessionId, text) {
  const session = sessions.get(sessionId);
  if (!session) return;
  if (
    session.elevenLabsWs?.readyState === WebSocket.OPEN &&
    session.elevenLabsReady
  ) {
    session.elevenLabsWs.send(
      JSON.stringify({ text, try_trigger_generation: true }),
    );
  } else {
    session.textBuffer.push(text);
  }
}

function flushElevenLabsStream(sessionId) {
  const session = sessions.get(sessionId);
  if (session?.elevenLabsWs?.readyState === WebSocket.OPEN) {
    session.elevenLabsWs.send(JSON.stringify({ text: "" }));
  }
}

function closeElevenLabsWs(sessionId) {
  const session = sessions.get(sessionId);
  if (session?.elevenLabsWs) {
    try {
      if (session.elevenLabsWs.readyState === WebSocket.CONNECTING)
        session.elevenLabsWs.terminate();
      else if (session.elevenLabsWs.readyState === WebSocket.OPEN)
        session.elevenLabsWs.close();
    } catch {}
    session.elevenLabsWs = null;
    session.elevenLabsReady = false;
    session.elevenLabsOpening = false;
    session.textBuffer = [];
  }
}

// ─── Mock booking write-back ──────────────────────────────────────────────────
function generateBookingRef() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `PC-${stamp}${rand}`;
}

async function createMockBooking({
  sessionId,
  customer_name,
  phone,
  vehicle,
  brand,
  type,
  date,
  time,
  notes,
}) {
  const booking_ref = generateBookingRef();
  const doc = new MockBooking({
    id: uuidv4(),
    booking_ref,
    sessionId: sessionId || null,
    customer_name,
    phone: phone || null,
    vehicle: vehicle || null,
    brand: brand || null,
    type,
    date,
    time,
    notes: notes || null,
  });
  await doc.save();
  return doc;
}

// ─── Function call handler ────────────────────────────────────────────────────
async function handleFunctionCall(sessionId, eventOrItem) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const call = toFunctionCallPayload(eventOrItem);
  if (!call || call.name !== "save_call_log") return;

  const callId = typeof call.call_id === "string" ? call.call_id : null;
  if (callId && session.processedCallIds.has(callId)) return;
  if (callId) session.processedCallIds.add(callId);

  try {
    const args = JSON.parse(call.arguments);
    console.log(
      `[${sessionId}] Saving call log | name: ${args.caller_name} | intent: ${args.intent_category} | outcome: ${args.outcome}`,
    );

    // If a booking was agreed on the call, write it to the mock booking
    // calendar and attach the generated reference to the log.
    let bookingRecord = null;
    if (args.booking?.date && args.booking?.time) {
      bookingRecord = await createMockBooking({
        sessionId,
        customer_name: args.caller_name,
        phone: args.caller_phone,
        vehicle: args.vehicle_interest || session.customerContext?.vehicle,
        brand: session.customerContext?.brand,
        type: args.booking.type || "service",
        date: args.booking.date,
        time: args.booking.time,
      });
      session.onEvent({
        type: "mock-booking-created",
        data: {
          booking_ref: bookingRecord.booking_ref,
          date: bookingRecord.date,
          time: bookingRecord.time,
          type: bookingRecord.type,
        },
      });
    }

    const logId = uuidv4();
    const callLog = new CallLog({
      id: logId,
      sessionId,
      isSimulation: true,
      customerId: session.customerContext?.id || null,
      brand: session.customerContext?.brand || null,
      caller_name: args.caller_name || null,
      caller_phone: args.caller_phone || null,
      caller_email: args.caller_email || null,
      vehicle_interest:
        args.vehicle_interest || session.customerContext?.vehicle || null,
      scenario: session.customerContext?.scenario || null,
      intent_category: args.intent_category,
      outcome: args.outcome,
      booking: bookingRecord
        ? {
            date: bookingRecord.date,
            time: bookingRecord.time,
            type: bookingRecord.type,
            booking_ref: bookingRecord.booking_ref,
          }
        : { date: null, time: null, type: null, booking_ref: null },
      upgrade_interest_level: args.upgrade_interest_level || null,
      objections: Array.isArray(args.objections) ? args.objections : [],
      recommended_next_action: args.recommended_next_action || null,
      ai_summary: args.ai_summary || null,
      sentiment: args.sentiment || "neutral",
      confidence_score: args.confidence_score || null,
      escalated: args.escalated || false,
      // Snapshot only — closeSession() re-syncs with the full transcript.
      full_transcript: session.transcript || [],
    });

    await callLog.save();
    session.callLogs.push({ id: logId, ...args });
    console.log(`[${sessionId}] Call log saved to MongoDB: ${logId}`);

    sendWsJson(session.ws, {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify({
          success: true,
          message: "Call log saved successfully.",
          log_id: logId,
          outcome: args.outcome,
          booking_ref: bookingRecord?.booking_ref || null,
        }),
      },
    });
    sendWsJson(session.ws, { type: "response.create" });
    session.onEvent({
      type: "call-logged",
      data: { ...args, booking_ref: bookingRecord?.booking_ref || null },
    });
  } catch (err) {
    if (callId) session.processedCallIds.delete(callId);
    console.error(`[${sessionId}] Call log save failed:`, err.message);
  }
}

// ─── OpenAI Event handler ─────────────────────────────────────────────────────
async function handleRealtimeEvent(sessionId, event) {
  const session = sessions.get(sessionId);
  if (!session) return;

  switch (event.type) {
    case "session.created":
    case "session.updated":
      break;

    case "response.created":
      session.isResponseActive = true;
      session.currentAssistantText = "";
      if (!session.firstResponseCreatedMs)
        session.firstResponseCreatedMs = Date.now();
      if (
        !session.elevenLabsWs ||
        (session.elevenLabsWs.readyState !== WebSocket.OPEN &&
          session.elevenLabsWs.readyState !== WebSocket.CONNECTING)
      ) {
        openElevenLabsStream(sessionId);
      }
      break;

    case "response.output_text.delta":
    case "response.text.delta":
      sendTextToElevenLabs(sessionId, event.delta);
      session.currentAssistantText += event.delta || "";
      session.onEvent({ type: "transcript-delta", delta: event.delta });
      break;

    case "response.audio_transcript.delta":
      sendTextToElevenLabs(sessionId, event.delta);
      session.currentAssistantText += event.delta || "";
      session.onEvent({ type: "transcript-delta", delta: event.delta });
      break;

    case "response.audio.delta":
      if (event.delta) {
        if (
          !session.elevenLabsWs ||
          session.elevenLabsWs.readyState !== WebSocket.OPEN
        ) {
          session.recorder.addAgentAudio(event.delta);
          session.onEvent({ type: "audio-delta", delta: event.delta });
        }
      }
      break;

    case "response.audio.done":
      break;

    case "response.output_text.done":
    case "response.text.done": {
      flushElevenLabsStream(sessionId);
      const assistantText = (
        event.text ||
        session.currentAssistantText ||
        ""
      ).trim();
      if (assistantText)
        session.transcript.push({
          role: "assistant",
          text: assistantText,
          ts: Date.now(),
        });
      session.currentAssistantText = "";
      session.onEvent({ type: "transcript-done", transcript: event.text });
      break;
    }

    case "response.audio_transcript.done": {
      flushElevenLabsStream(sessionId);
      const aText = (
        event.transcript ||
        session.currentAssistantText ||
        ""
      ).trim();
      if (aText)
        session.transcript.push({
          role: "assistant",
          text: aText,
          ts: Date.now(),
        });
      session.currentAssistantText = "";
      session.onEvent({
        type: "transcript-done",
        transcript: event.transcript,
      });
      break;
    }

    case "response.done": {
      session.isResponseActive = false;
      const calls = extractFunctionCallsFromResponse(event.response);
      for (const fc of calls) await handleFunctionCall(sessionId, fc);
      break;
    }

    case "response.output_item.done":
      if (event.item) {
        const fc = toFunctionCallPayload(event.item);
        if (fc) await handleFunctionCall(sessionId, fc);
      }
      break;

    case "response.function_call_arguments.done":
      await handleFunctionCall(sessionId, event);
      break;

    case "input_audio_buffer.speech_started":
      if (session.isResponseActive) {
        sendWsJson(session.ws, { type: "response.cancel" });
        session.isResponseActive = false;
        openElevenLabsStream(sessionId, true);
      }
      session.onEvent({ type: "clear-audio" });
      session.onEvent({ type: "speech-started" });
      break;

    case "input_audio_buffer.speech_stopped":
      break;

    case "input_audio_buffer.committed":
      break;

    case "conversation.item.input_audio_transcription.completed":
      if (event.transcript && event.transcript.trim()) {
        session.transcript.push({
          role: "user",
          text: event.transcript.trim(),
          ts: Date.now(),
        });
      }
      session.onEvent({
        type: "user-transcript",
        transcript: event.transcript,
      });
      break;

    case "error":
      if (event.error && event.error.code === "response_cancel_not_active")
        break;
      console.error(
        `[${sessionId}] OpenAI error:`,
        JSON.stringify(event.error),
      );
      session.onEvent({ type: "error", error: event.error });
      break;

    default:
      break;
  }
}

// ─── Close session ────────────────────────────────────────────────────────────
async function closeSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const hadConversation = session.transcript && session.transcript.length > 0;

  if (hadConversation) {
    try {
      const result = session.recorder.saveToFile();
      session.onEvent({
        type: "recording-saved",
        data: {
          filename: result.filename,
          url: `/recordings/${result.filename}`,
        },
      });
    } catch (err) {
      console.error(`[${sessionId}] Recording save failed:`, err.message);
    }

    try {
      const summaryData = await generateCallSummary(session.transcript);

      session.onEvent({
        type: "call-summary",
        data: { ...summaryData, fullTranscript: session.transcript },
      });

      if (session.callLogs.length > 0) {
        const updated = await CallLog.findOneAndUpdate(
          { sessionId },
          {
            $set: {
              full_transcript: session.transcript || [],
              ai_summary: summaryData.summary || undefined,
              sentiment: summaryData.sentiment || undefined,
              upgrade_interest_level:
                summaryData.upgrade_interest_level || undefined,
              objections: summaryData.objections || undefined,
              recommended_next_action:
                summaryData.recommended_next_action || undefined,
            },
          },
          { sort: { createdAt: -1 }, new: true },
        );
        console.log(
          `[${sessionId}] Synced existing call log with full final transcript` +
            (updated ? ` (id: ${updated.id})` : " (no matching row found)"),
        );
      } else {
        let bookingRecord = null;
        if (summaryData.booking?.date && summaryData.booking?.time) {
          bookingRecord = await createMockBooking({
            sessionId,
            customer_name:
              summaryData.caller_name ||
              session.customerContext?.name ||
              "Unknown",
            vehicle:
              summaryData.vehicle_interest || session.customerContext?.vehicle,
            brand: session.customerContext?.brand,
            type: summaryData.booking.type || "service",
            date: summaryData.booking.date,
            time: summaryData.booking.time,
          });
        }

        const logId = uuidv4();
        const callLog = new CallLog({
          id: logId,
          sessionId,
          isSimulation: true,
          customerId: session.customerContext?.id || null,
          brand: session.customerContext?.brand || null,
          caller_name: summaryData.caller_name || null,
          vehicle_interest:
            summaryData.vehicle_interest ||
            session.customerContext?.vehicle ||
            null,
          scenario: session.customerContext?.scenario || null,
          intent_category: summaryData.intent_category || "no_transcript_admin",
          outcome: summaryData.outcome || "message_taken",
          booking: bookingRecord
            ? {
                date: bookingRecord.date,
                time: bookingRecord.time,
                type: bookingRecord.type,
                booking_ref: bookingRecord.booking_ref,
              }
            : { date: null, time: null, type: null, booking_ref: null },
          upgrade_interest_level: summaryData.upgrade_interest_level || "none",
          objections: summaryData.objections || [],
          recommended_next_action: summaryData.recommended_next_action || null,
          ai_summary: summaryData.summary || null,
          sentiment: summaryData.sentiment || "neutral",
          confidence_score: summaryData.confidence_score ?? null,
          escalated: false,
          full_transcript: session.transcript || [],
        });
        await callLog.save();
        console.log(`[${sessionId}] End-of-call summary saved: ${logId}`);
      }
    } catch (err) {
      console.error(
        `[${sessionId}] Summary generation/save failed:`,
        err.message,
      );
    }
  } else {
    console.log(
      `[${sessionId}] Closing empty session — skipping recording/summary/save`,
    );
  }

  closeElevenLabsWs(sessionId);
  try {
    session.ws.close();
  } catch {}
  sessions.delete(sessionId);
  console.log(`[${sessionId}] Session closed`);
}

// ─── Prewarm ──────────────────────────────────────────────────────────────────
function clearPrewarmState(sessionId) {
  const state = prewarmStates.get(sessionId);
  if (!state) return;
  clearTimeout(state.ttlTimer);
  prewarmStates.delete(sessionId);
}

function startPrewarm(sessionId, eventForwarder) {
  if (prewarmStates.has(sessionId)) return prewarmStates.get(sessionId).promise;
  const state = { promise: null, ready: false, failed: false, ttlTimer: null };
  state.promise = createRealtimeSession(sessionId, eventForwarder, null)
    .then(() => {
      state.ready = true;
    })
    .catch((err) => {
      state.failed = true;
      throw err;
    });
  state.ttlTimer = setTimeout(() => {
    if (!prewarmStates.has(sessionId)) return;
    clearPrewarmState(sessionId);
    closeSession(sessionId);
  }, PREWARM_TTL_MS);
  prewarmStates.set(sessionId, state);
  return state.promise;
}

// ─── Event Forwarder ──────────────────────────────────────────────────────────
function buildEventForwarder(socket) {
  return (event) => {
    switch (event.type) {
      case "audio-delta":
        socket.emit("audio-delta", { delta: event.delta });
        break;
      case "clear-audio":
        socket.emit("audio-clear", {});
        break;
      case "transcript-delta":
        socket.emit("transcript-delta", { delta: event.delta });
        break;
      case "transcript-done":
        socket.emit("transcript-done", { transcript: event.transcript });
        break;
      case "user-transcript":
        socket.emit("user-transcript", { transcript: event.transcript });
        break;
      case "speech-started":
        socket.emit("speech-started", {});
        break;
      case "call-logged":
        socket.emit("call-logged", event.data);
        break;
      case "call-summary":
        socket.emit("call-summary", event.data);
        break;
      case "recording-saved":
        socket.emit("recording-saved", event.data);
        break;
      case "mock-booking-created":
        socket.emit("mock-booking-created", event.data);
        break;
      case "error":
        socket.emit("realtime-error", { error: event.error });
        break;
      case "session-closed":
        socket.emit("session-closed", {});
        break;
    }
  };
}

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const forwarder = buildEventForwarder(socket);

  const prewarmTimer = setTimeout(() => {
    prewarmTimers.delete(socket.id);
    startPrewarm(socket.id, forwarder).catch(() => {});
  }, PREWARM_CONNECT_DELAY_MS);
  prewarmTimers.set(socket.id, prewarmTimer);

  // `data.customer` replaces the old flat `carContext` string — full
  // simulation-customer object (name, vehicle, brand, suburb, lastService,
  // upgradeScore, scenario, id) so the outbound scenario prompts can branch.
  socket.on("start-session", async (data) => {
    const sessionId = socket.id;
    const customerContext = data?.customer || null;

    const pendingPrewarm = prewarmTimers.get(sessionId);
    if (pendingPrewarm) {
      clearTimeout(pendingPrewarm);
      prewarmTimers.delete(sessionId);
    }

    try {
      if (customerContext) {
        clearPrewarmState(sessionId);
        await closeSession(sessionId);
        await createRealtimeSession(sessionId, forwarder, customerContext);
        socket.emit("session-started", { sessionId });
        triggerGreeting(sessionId);
        return;
      }

      let state = prewarmStates.get(sessionId);
      if (!state) {
        await startPrewarm(sessionId, forwarder);
        state = prewarmStates.get(sessionId);
      }
      if (state) {
        try {
          await state.promise;
          if (state.ready) {
            clearPrewarmState(sessionId);
            socket.emit("session-started", { sessionId });
            triggerGreeting(sessionId);
            return;
          }
        } catch {}
        clearPrewarmState(sessionId);
      }

      await createRealtimeSession(sessionId, forwarder, null);
      socket.emit("session-started", { sessionId });
      triggerGreeting(sessionId);
    } catch (err) {
      console.error(`[${sessionId}] Session start failed:`, err.message);
      socket.emit("realtime-error", {
        error: { message: "Failed to connect to AI service" },
      });
    }
  });

  socket.on("audio-chunk", (data) => {
    if (data?.audio) sendAudio(socket.id, data.audio);
  });

  socket.on("get-transcript", () => {
    const session = sessions.get(socket.id);
    socket.emit("transcript-state", { transcript: session?.transcript || [] });
  });

  socket.on("end-session", async () => {
    clearPrewarmState(socket.id);
    await closeSession(socket.id);
    socket.emit("session-closed", {});
  });

  socket.on("disconnect", async () => {
    const pendingPrewarm = prewarmTimers.get(socket.id);
    if (pendingPrewarm) {
      clearTimeout(pendingPrewarm);
      prewarmTimers.delete(socket.id);
    }
    clearPrewarmState(socket.id);
    await closeSession(socket.id);
  });
});

// ─── REST Endpoints — Call Logs ────────────────────────────────────────────────
app.get("/api/call-logs", async (req, res) => {
  try {
    const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch call logs" });
  }
});

app.get("/api/call-logs/intent/:intent", async (req, res) => {
  try {
    const logs = await CallLog.find({ intent_category: req.params.intent })
      .sort({ createdAt: -1 })
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch call logs" });
  }
});

// CSV export of call logs — for stakeholder review / spreadsheet handoff.
app.get("/api/call-logs/export-csv", async (req, res) => {
  try {
    const logs = await CallLog.find().sort({ createdAt: -1 }).lean();
    const columns = [
      "id",
      "sessionId",
      "isSimulation",
      "brand",
      "caller_name",
      "caller_phone",
      "vehicle_interest",
      "scenario",
      "intent_category",
      "outcome",
      "upgrade_interest_level",
      "recommended_next_action",
      "sentiment",
      "confidence_score",
      "escalated",
      "ai_summary",
      "createdAt",
    ];
    const rows = logs.map((l) => ({
      ...l,
      objections: undefined,
      booking: undefined,
      createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : "",
    }));
    const csv = toCsv(rows, columns);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pc-call-logs-${Date.now()}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to export call logs" });
  }
});

app.get("/api/recordings", (req, res) => {
  const files = fs
    .readdirSync(RECORDINGS_DIR)
    .filter((f) => f.endsWith(".wav"));
  res.json(
    files.map((f) => ({
      filename: f,
      url: `/recordings/${f}`,
      size:
        (fs.statSync(path.join(RECORDINGS_DIR, f)).size / 1024 / 1024).toFixed(
          2,
        ) + " MB",
    })),
  );
});

app.post("/api/summary", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!Array.isArray(transcript))
      return res.status(400).json({ error: "transcript must be an array" });
    const summary = await generateCallSummary(transcript);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// ─── Session Summary PDF ──────────────────────────────────────────────────────
// Replaces the old client-side .txt blob download. Takes whatever the
// Simulation UI already has in memory (selected customer, call duration,
// call log) and streams back a formatted PDF — no DB lookup required, so it
// works even for a session that never called save_call_log.
function formatDurationForPdf(totalSeconds) {
  const s = Math.max(0, Number(totalSeconds) || 0);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function humanize(value) {
  if (!value) return "N/A";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// app.post("/api/session-summary/pdf", async (req, res) => {
//   try {
//     const { customer, duration, callLog } = req.body || {};

//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const filename = `voice-session-summary-${Date.now()}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

//     doc.pipe(res);

//     const PAGE_LEFT = doc.page.margins.left;
//     const PAGE_RIGHT = doc.page.width - doc.page.margins.right;

//     // ── Header ──
//     doc
//       .fillColor("#0C1E3C")
//       .fontSize(20)
//       .font("Helvetica-Bold")
//       .text("Patterson Cheney", PAGE_LEFT, doc.y);
//     doc
//       .fillColor("#666666")
//       .fontSize(12)
//       .font("Helvetica")
//       .text("Voice Session Summary", PAGE_LEFT, doc.y + 2);

//     doc.moveDown(0.8);
//     doc
//       .strokeColor("#0C1E3C")
//       .lineWidth(2)
//       .moveTo(PAGE_LEFT, doc.y)
//       .lineTo(PAGE_RIGHT, doc.y)
//       .stroke();
//     doc.moveDown(1);

//     // ── Meta row ──
//     const dateStr = new Date().toLocaleString();
//     doc.fillColor("#000000").fontSize(10).font("Helvetica");
//     doc.text(`Date: ${dateStr}`);
//     doc.text(`Duration: ${formatDurationForPdf(duration)}`);
//     doc.moveDown(1);

//     const sectionHeader = (title) => {
//       doc.fillColor("#0C1E3C").fontSize(13).font("Helvetica-Bold").text(title);
//       doc.moveDown(0.3);
//       doc
//         .strokeColor("#dddddd")
//         .lineWidth(1)
//         .moveTo(PAGE_LEFT, doc.y)
//         .lineTo(PAGE_RIGHT, doc.y)
//         .stroke();
//       doc.moveDown(0.5);
//     };

//     const row = (label, value) => {
//       const labelWidth = 150;
//       const y = doc.y;
//       doc
//         .fillColor("#666666")
//         .fontSize(10)
//         .font("Helvetica-Bold")
//         .text(label, PAGE_LEFT, y, { width: labelWidth, continued: false });
//       doc
//         .fillColor("#000000")
//         .font("Helvetica")
//         .text(value || "N/A", PAGE_LEFT + labelWidth, y, {
//           width: PAGE_RIGHT - PAGE_LEFT - labelWidth,
//         });
//       doc.moveDown(0.4);
//     };

//     // ── Customer Information ──
//     if (customer) {
//       sectionHeader("Customer Information");
//       row("Name", customer.name);
//       row("Vehicle", customer.vehicle);
//       row("Brand", customer.brand);
//       row("Location", customer.suburb);
//       row("Scenario", humanize(customer.scenario));
//       if (customer.lastService) row("Last Service", customer.lastService);
//       doc.moveDown(0.8);
//     }

//     // ── Call Log ──
//     if (callLog) {
//       sectionHeader("Call Log");
//       row("Caller Name", callLog.caller_name);
//       row("Intent", humanize(callLog.intent_category));
//       row("Outcome", humanize(callLog.outcome));
//       row("Sentiment", humanize(callLog.sentiment));
//       if (callLog.upgrade_interest_level)
//         row("Upgrade Interest", humanize(callLog.upgrade_interest_level));
//       if (callLog.recommended_next_action)
//         row("Recommended Next Action", callLog.recommended_next_action);
//       if (callLog.booking_ref) row("Booking Reference", callLog.booking_ref);
//       if (Array.isArray(callLog.objections) && callLog.objections.length)
//         row("Objections", callLog.objections.join(", "));
//       doc.moveDown(0.5);

//       if (callLog.ai_summary) {
//         doc
//           .fillColor("#0C1E3C")
//           .fontSize(11)
//           .font("Helvetica-Bold")
//           .text("AI Summary");
//         doc.moveDown(0.2);
//         doc
//           .fillColor("#333333")
//           .fontSize(10)
//           .font("Helvetica")
//           .text(callLog.ai_summary, PAGE_LEFT, doc.y, {
//             width: PAGE_RIGHT - PAGE_LEFT,
//             align: "left",
//           });
//       }
//     }

//     if (!customer && !callLog) {
//       doc
//         .fillColor("#666666")
//         .fontSize(11)
//         .text("No session data was available to include in this report.");
//     }

//     // ── Footer ──
//     doc
//       .fontSize(8)
//       .fillColor("#999999")
//       .text(
//         "Generated by Patterson Cheney Voice Agent Simulation",
//         PAGE_LEFT,
//         doc.page.height - doc.page.margins.bottom - 15,
//         { align: "center", width: PAGE_RIGHT - PAGE_LEFT },
//       );

//     doc.end();
//   } catch (err) {
//     console.error("Session summary PDF generation failed:", err.message);
//     if (!res.headersSent) {
//       res.status(500).json({ error: "Failed to generate PDF summary" });
//     }
//   }
// });
app.post("/api/session-summary/pdf", async (req, res) => {
  try {
    const { customer, duration, callLog } = req.body || {};

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const filename = `voice-session-summary-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    const PAGE_LEFT = doc.page.margins.left;
    const PAGE_RIGHT = doc.page.width - doc.page.margins.right;
    const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;
    const LABEL_WIDTH = 150;

    // ---------------- Header ----------------
    doc
      .fillColor("#0C1E3C")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Patterson Cheney", PAGE_LEFT, doc.y, {
        align: "left",
      });

    doc
      .fillColor("#666666")
      .font("Helvetica")
      .fontSize(12)
      .text("Voice Session Summary", PAGE_LEFT, doc.y + 2, {
        align: "left",
      });

    doc.moveDown(0.8);

    doc
      .strokeColor("#0C1E3C")
      .lineWidth(2)
      .moveTo(PAGE_LEFT, doc.y)
      .lineTo(PAGE_RIGHT, doc.y)
      .stroke();

    doc.moveDown();

    // ---------------- Meta ----------------
    const dateStr = new Date().toLocaleString();

    doc
      .fillColor("#000")
      .font("Helvetica")
      .fontSize(10)
      .text(`Date: ${dateStr}`, PAGE_LEFT, doc.y);

    doc.text(`Duration: ${formatDurationForPdf(duration)}`, PAGE_LEFT, doc.y);

    doc.moveDown();

    // ---------------- Helpers ----------------
    const sectionHeader = (title) => {
      doc.x = PAGE_LEFT;

      doc
        .fillColor("#0C1E3C")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(title, PAGE_LEFT, doc.y, {
          width: CONTENT_WIDTH,
          align: "left",
        });

      doc.moveDown(0.3);

      doc
        .strokeColor("#dddddd")
        .lineWidth(1)
        .moveTo(PAGE_LEFT, doc.y)
        .lineTo(PAGE_RIGHT, doc.y)
        .stroke();

      doc.moveDown(0.6);
    };

    const row = (label, value) => {
      const startY = doc.y;

      doc
        .fillColor("#666666")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(label, PAGE_LEFT, startY, {
          width: LABEL_WIDTH,
          align: "left",
        });

      doc
        .fillColor("#000000")
        .font("Helvetica")
        .fontSize(10)
        .text(value || "N/A", PAGE_LEFT + LABEL_WIDTH, startY, {
          width: CONTENT_WIDTH - LABEL_WIDTH,
          align: "left",
        });

      doc.moveDown(0.5);
    };

    // ---------------- Customer Information ----------------
    if (customer) {
      sectionHeader("Customer Information");

      row("Name", customer.name);
      row("Vehicle", customer.vehicle);
      row("Brand", customer.brand);
      row("Location", customer.suburb);
      row("Scenario", humanize(customer.scenario));

      if (customer.lastService) {
        row("Last Service", customer.lastService);
      }

      doc.moveDown();
    }

    // ---------------- Call Log ----------------
    if (callLog) {
      sectionHeader("Call Log");

      row("Caller Name", callLog.caller_name);
      row("Intent", humanize(callLog.intent_category));
      row("Outcome", humanize(callLog.outcome));
      row("Sentiment", humanize(callLog.sentiment));

      if (callLog.upgrade_interest_level) {
        row("Upgrade Interest", humanize(callLog.upgrade_interest_level));
      }

      if (callLog.recommended_next_action) {
        row("Recommended Next Action", callLog.recommended_next_action);
      }

      if (callLog.booking_ref) {
        row("Booking Reference", callLog.booking_ref);
      }

      if (Array.isArray(callLog.objections) && callLog.objections.length) {
        row("Objections", callLog.objections.join(", "));
      }

      doc.moveDown();

      // ---------------- AI Summary ----------------
      sectionHeader("AI Summary");

      doc
        .fillColor("#333333")
        .font("Helvetica")
        .fontSize(10)
        .text(callLog.ai_summary || "N/A", PAGE_LEFT, doc.y, {
          width: CONTENT_WIDTH,
          align: "left",
        });

      doc.moveDown();
    }

    // ---------------- Empty State ----------------
    if (!customer && !callLog) {
      doc
        .fillColor("#666666")
        .font("Helvetica")
        .fontSize(11)
        .text(
          "No session data was available to include in this report.",
          PAGE_LEFT,
          doc.y,
          {
            width: CONTENT_WIDTH,
            align: "left",
          },
        );
    }

    // ---------------- Footer ----------------
    doc
      .fillColor("#999999")
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Generated by Patterson Cheney Voice Agent Simulation",
        PAGE_LEFT,
        doc.page.height - doc.page.margins.bottom - 15,
        {
          width: CONTENT_WIDTH,
          align: "center",
        },
      );

    doc.end();
  } catch (err) {
    console.error("Session summary PDF generation failed:", err.message);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate PDF summary",
      });
    }
  }
});

// ─── REST Endpoints — Simulation Customers (CSV import/export) ───────────────
// Test-sheet columns: name,phone,vehicle,brand,suburb,scenario,lastService,upgradeScore
app.post(
  "/api/simulation/customers/import-csv",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: "No CSV file uploaded (field name: 'file')" });
      const text = fs.readFileSync(req.file.path, "utf8");
      const rows = parseCsv(text);
      fs.unlink(req.file.path, () => {});

      if (rows.length === 0)
        return res.status(400).json({ error: "CSV had no data rows" });

      const requiredCols = ["name", "vehicle", "brand", "scenario"];
      const missingCols = requiredCols.filter((c) => !(c in rows[0]));
      if (missingCols.length) {
        return res.status(400).json({
          error: `CSV missing required column(s): ${missingCols.join(", ")}`,
          expectedColumns: [
            "name",
            "phone",
            "vehicle",
            "brand",
            "suburb",
            "scenario",
            "lastService",
            "upgradeScore",
          ],
        });
      }

      const batchLabel = req.body.batchLabel || `import_${Date.now()}`;
      const validScenarios = [
        "service_due",
        "upgrade_opportunity",
        "finance_renewal",
        "objection_handling",
        "callback_follow_up",
      ];
      const validBrands = ["Toyota", "Mercedes-Benz", "Isuzu"];

      const errors = [];
      const docs = [];
      rows.forEach((r, idx) => {
        const lineNo = idx + 2; // +1 for header, +1 for 1-index
        if (!r.name || !r.vehicle) {
          errors.push(`Line ${lineNo}: missing name or vehicle`);
          return;
        }
        if (!validBrands.includes(r.brand)) {
          errors.push(
            `Line ${lineNo}: brand must be one of ${validBrands.join(", ")}`,
          );
          return;
        }
        if (!validScenarios.includes(r.scenario)) {
          errors.push(
            `Line ${lineNo}: scenario must be one of ${validScenarios.join(", ")}`,
          );
          return;
        }
        docs.push({
          id: uuidv4(),
          name: r.name,
          phone: r.phone || null,
          vehicle: r.vehicle,
          brand: r.brand,
          suburb: r.suburb || null,
          scenario: r.scenario,
          lastService: r.lastService || null,
          upgradeScore: r.upgradeScore ? Number(r.upgradeScore) : 3,
          batchLabel,
        });
      });

      if (docs.length) await SimulationCustomer.insertMany(docs);

      res.json({
        imported: docs.length,
        skipped: errors.length,
        batchLabel,
        errors: errors.slice(0, 20), // cap so a bad file doesn't flood the response
      });
    } catch (err) {
      console.error("CSV import failed:", err.message);
      res.status(500).json({ error: "Failed to import CSV" });
    }
  },
);

app.get("/api/simulation/customers", async (req, res) => {
  try {
    const filter = req.query.batchLabel
      ? { batchLabel: req.query.batchLabel }
      : {};
    const customers = await SimulationCustomer.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch simulation customers" });
  }
});

app.get("/api/simulation/customers/export-csv", async (req, res) => {
  try {
    const filter = req.query.batchLabel
      ? { batchLabel: req.query.batchLabel }
      : {};
    const customers = await SimulationCustomer.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    const columns = [
      "name",
      "phone",
      "vehicle",
      "brand",
      "suburb",
      "scenario",
      "lastService",
      "upgradeScore",
      "batchLabel",
    ];
    const csv = toCsv(customers, columns);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pc-simulation-customers-${Date.now()}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to export simulation customers" });
  }
});

app.delete("/api/simulation/customers/:id", async (req, res) => {
  try {
    await SimulationCustomer.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// Downloadable CSV template so stakeholders know the exact expected columns.
app.get("/api/simulation/customers/template-csv", (req, res) => {
  const csv = toCsv(
    [
      {
        name: "James Nguyen",
        phone: "0400000001",
        vehicle: "2021 Toyota HiLux SR5",
        brand: "Toyota",
        suburb: "Keysborough",
        scenario: "service_due",
        lastService: "2025-10-20",
        upgradeScore: 5,
      },
      {
        name: "Sarah Thompson",
        phone: "0400000002",
        vehicle: "2022 Mercedes GLC 300",
        brand: "Mercedes-Benz",
        suburb: "Berwick",
        scenario: "upgrade_opportunity",
        lastService: "2025-09-10",
        upgradeScore: 4,
      },
    ],
    [
      "name",
      "phone",
      "vehicle",
      "brand",
      "suburb",
      "scenario",
      "lastService",
      "upgradeScore",
    ],
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="pc-simulation-customer-template.csv"',
  );
  res.send(csv);
});

// ─── REST Endpoints — Mock Booking Calendar ───────────────────────────────────
app.get("/api/mock-bookings", async (req, res) => {
  try {
    const bookings = await MockBooking.find().sort({ date: 1, time: 1 }).lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mock bookings" });
  }
});

// Manual create — lets the Simulation UI's calendar picker book a slot
// directly (outside of a live agent call), matching the requirement:
// "Mock booking calendar & confirmation UI that writes fake booking ref
// back."
app.post("/api/mock-bookings", async (req, res) => {
  try {
    const { customer_name, phone, vehicle, brand, type, date, time, notes } =
      req.body;
    if (!customer_name || !type || !date || !time) {
      return res
        .status(400)
        .json({ error: "customer_name, type, date, time are required" });
    }
    const booking = await createMockBooking({
      customer_name,
      phone,
      vehicle,
      brand,
      type,
      date,
      time,
      notes,
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to create mock booking" });
  }
});

app.post("/api/mock-bookings/:id/cancel", async (req, res) => {
  try {
    const booking = await MockBooking.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status: "cancelled" } },
      { new: true },
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", sessions: sessions.size }),
);

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║   Patterson Cheney — AI Voice Agent (Simulation/Vetting Mode) ║
║   Running on http://localhost:${PORT}                         ║
║                                                              ║
║   Model:          ${OPENAI_REALTIME_MODEL}                   ║
║   Summary Model:  ${OPENAI_SUMMARY_MODEL}                    ║
║   OpenAI API Key: ${OPENAI_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
║   ElevenLabs Key: ${ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing"}                             ║
║   Voice ID:       ${ELEVENLABS_VOICE_ID}                     ║
║   MongoDB:        ${MONGODB_URI ? "✓ Set" : "✗ Missing"}                             ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
