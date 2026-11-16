import { Gift } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { firstName } from '../format.js';
import Confetti from './Confetti.jsx';

const ROW = 56;
const CENTER = ROW;
const LOOPS = 14;

export default function SlotReveal({ names, receiver, onHide }) {
  const [phase, setPhase] = useState('idle');
  const labels = useMemo(() => {
    const list = names.map((person) => firstName(person.name));
    return list.length > 0 ? list : [firstName(receiver.name)];
  }, [names, receiver]);

  const winnerLabel = firstName(receiver.name);
  const fillers = useMemo(() => pickFillers(labels, winnerLabel), [labels, winnerLabel]);

  useEffect(() => {
    if (phase !== 'spinning') return undefined;
    const done = window.setTimeout(() => setPhase('done'), 4800);
    return () => window.clearTimeout(done);
  }, [phase]);

  if (phase === 'idle') {
    return (
      <button type="button" className="reveal" onClick={() => setPhase('spinning')} aria-live="polite">
        <span className="reveal__gift" aria-hidden="true">
          <Gift size={56} />
        </span>
        <span className="reveal__title">Toca para descubrir</span>
        <span className="reveal__hint">a quién le haces el regalo</span>
      </button>
    );
  }

  return (
    <div className={`slot${phase === 'done' ? ' slot--done' : ''}`} aria-live="polite">
      <Confetti active={phase === 'done'} />
      <p className="slot__eyebrow">{phase === 'done' ? 'Te ha tocado regalar a' : 'Sorteando…'}</p>
      <div className="slot__machine" aria-hidden={phase !== 'done'}>
        <Reel names={labels} stopAt={fillers[0]} delay={0} spinning={phase === 'spinning'} />
        <Reel names={labels} stopAt={winnerLabel} delay={750} spinning={phase === 'spinning'} winner />
        <Reel names={labels} stopAt={fillers[1]} delay={380} spinning={phase === 'spinning'} />
      </div>
      {phase === 'done' && (
        <>
          <p className="slot__name">{receiver.name}</p>
          <button type="button" className="btn btn--ghost btn--block" onClick={onHide}>
            Ocultar
          </button>
        </>
      )}
    </div>
  );
}

function Reel({ names, stopAt, delay, spinning, winner = false }) {
  const { strip, stopIndex } = useMemo(() => buildLoop(names, stopAt), [names, stopAt]);
  const target = CENTER - stopIndex * ROW;
  const [offsetY, setOffsetY] = useState(CENTER);
  const [animate, setAnimate] = useState(false);
  const stripRef = useRef(null);

  useEffect(() => {
    if (!spinning) {
      setAnimate(false);
      setOffsetY(target);
      return undefined;
    }

    setAnimate(false);
    setOffsetY(CENTER);
    const kick = window.setTimeout(() => {
      if (stripRef.current) void stripRef.current.offsetHeight;
      setAnimate(true);
      setOffsetY(target);
    }, Math.max(delay, 40));

    return () => window.clearTimeout(kick);
  }, [spinning, target, delay]);

  return (
    <div className={`slot__reel${winner ? ' slot__reel--winner' : ''}`}>
      <span className="slot__window" aria-hidden="true" />
      <div
        ref={stripRef}
        className="slot__strip"
        style={{
          transform: `translateY(${offsetY}px)`,
          transitionDuration: animate ? `${2.9 + delay / 1000}s` : '0s',
        }}
      >
        {strip.map((name, index) => (
          <span key={`${name}-${index}`} className="slot__item">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildLoop(names, stopAt) {
  const base = names.length > 0 ? names : [stopAt];
  const strip = [];
  for (let loop = 0; loop < LOOPS; loop += 1) {
    for (const name of base) strip.push(name);
  }
  const stopIndex = strip.length;
  strip.push(stopAt);
  // Sigue el bucle para que debajo del nombre elegido también se vean más nombres.
  for (let index = 0; index < Math.max(base.length, 4); index += 1) {
    strip.push(base[index % base.length]);
  }
  return { strip, stopIndex };
}

function pickFillers(names, winner) {
  const pool = names.filter((name) => name !== winner);
  if (pool.length === 0) return [winner, winner];
  if (pool.length === 1) return [pool[0], pool[0]];
  const first = pool[Math.floor(Math.random() * pool.length)];
  let second = pool[Math.floor(Math.random() * pool.length)];
  if (second === first && pool.length > 1) {
    second = pool.find((name) => name !== first) ?? first;
  }
  return [first, second];
}
