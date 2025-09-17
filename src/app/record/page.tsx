"use client";
import { useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function RecordPage() {
  const { data: session, status } = useSession();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [transcript, setTranscript] = useState<string | null>(null);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    mediaRecorderRef.current = rec;
    setChunks([]);
    rec.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);
    rec.start();
    setIsRecording(true);
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function upload() {
    if (status !== "authenticated") {
      await signIn();
      return;
    }
    const blob = new Blob(chunks, { type: "audio/webm" });
    const file = new File([blob], "recording.webm", { type: "audio/webm" });
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    const json = await res.json();
    setTranscript(json.transcript || "");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Record & Transcribe</h1>
      <div className="rounded border border-zinc-800 p-4 space-y-3">
        <div className="flex gap-2">
          {!isRecording ? (
            <button className="bg-green-500 text-black rounded px-3 py-2" onClick={start}>
              Start Recording
            </button>
          ) : (
            <button className="bg-red-500 text-black rounded px-3 py-2" onClick={stop}>
              Stop Recording
            </button>
          )}
          <button className="border border-zinc-700 rounded px-3 py-2" onClick={upload} disabled={!chunks.length}>
            Upload & Transcribe
          </button>
        </div>
        {transcript && (
          <div className="rounded bg-zinc-900 p-3 text-sm text-zinc-300">
            {transcript}
          </div>
        )}
      </div>
    </div>
  );
}


