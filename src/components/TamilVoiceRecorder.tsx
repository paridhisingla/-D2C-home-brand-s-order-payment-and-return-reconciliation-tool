import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface TamilVoiceRecorderProps {
  onTranscript: (text: string) => void;
  lang?: 'ta' | 'en';
}

export const TamilVoiceRecorder: React.FC<TamilVoiceRecorderProps> = ({
  onTranscript,
  lang = 'ta',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const presets = [
    {
      tamil: 'தையல் மெஷின் மோட்டார் பழுதாகிவிட்டது, மெக்கானிக் வந்து சரிசெய்கிறார்',
      transcription: 'Stitching machine motor breakdown',
      category: 'Machine Breakdown',
    },
    {
      tamil: 'நீடில் உடைந்துவிட்டது, புதிய ஊசி வர தாமதம்',
      transcription: 'Needle broken on sewing line',
      category: 'Needle / Trims Shortage',
    },
    {
      tamil: 'பிரிண்டிங் ஸ்கிரீன் மை காய நேரம் எடுக்கிறது, வானிலை ஈரமாக உள்ளது',
      transcription: 'Printing screen ink curing slowly',
      category: 'Subcontract Printing / Washing Delay',
    },
    {
      tamil: 'மின்வெட்டு காரணமாக 2 மணி நேரம் வேலை நின்றது',
      transcription: 'Power cut downtime 2 hours',
      category: 'Power Outage / Utilities',
    },
    {
      tamil: 'துணியில் நிற மாற்றம் காணப்படுகிறது, சாயப்பட்டறைக்கு தகவல் அனுப்பப்பட்டுள்ளது',
      transcription: 'Fabric shade variation issue',
      category: 'Fabric / Dyeing Defect',
    },
  ];

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Auto-simulate transcription after 2.5 seconds of talking
      setTimeout(() => {
        setIsRecording(false);
        const selected = presets[activePresetIndex % presets.length];
        onTranscript(selected.tamil);
        setActivePresetIndex((prev) => prev + 1);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSelectPreset = (tamilText: string) => {
    onTranscript(tamilText);
  };

  return (
    <div className="space-y-3">
      {/* Voice Recorder Action Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-900/60'
              : 'bg-brand-600 hover:bg-brand-700 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 animate-bounce" />
              <span>
                {lang === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Recording...'} ({recordingSeconds}s)
              </span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>{lang === 'ta' ? 'குரல் பதிவு (தமிழ் வாய்ஸ் நோட்)' : 'Record Voice Note (Tamil)'}</span>
            </>
          )}
        </button>

        {isRecording && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce" />
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold ml-2">Listening in Tamil...</span>
          </div>
        )}
      </div>

      {/* Quick Factory Presets for Instant One-Tap Testing */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'ta' ? 'விரைவு தமிழ் மாதிரி குறிப்புகள் (தட்டவும்):' : 'One-Tap Tamil Voice/Floor Presets:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p.tamil)}
              className="text-left text-xs bg-stone-100/90 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 hover:border-brand-300 dark:hover:border-slate-600 border border-stone-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-brand-800 dark:hover:text-brand-300 px-3 py-2 rounded-xl transition shadow-2xs"
            >
              <div className="font-semibold truncate max-w-[280px]">{p.tamil}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
