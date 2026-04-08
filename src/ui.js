/**
 * UI wiring: step navigation, file input, form validation, and
 * download.  This is the only module that touches the DOM.
 */

import { detectLayout } from './detection.js';
import { generateEditedTicket } from './rendering.js';

// ── State ──────────────────────────────────────────────────────────

let origImg = null;
let layout = null;

// ── Helpers ────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

function goToStep(n) {
  $('step1').classList.toggle('hidden', n !== 1);
  $('step2').classList.toggle('hidden', n !== 2);
  $('step3').classList.toggle('hidden', n !== 3);
  $('s1').className = 'sp ' + (n > 1 ? 'd' : 'a');
  $('s2').className = 'sp ' + (n >= 2 ? (n > 2 ? 'd' : 'a') : '');
  $('s3').className = 'sp ' + (n >= 3 ? 'a' : '');
}

function checkForm() {
  $('bg').disabled = !(
    $('is').value.trim() && $('ir').value.trim() && $('it').value.trim()
  );
}

function reset() {
  origImg = null;
  layout = null;
  $('fi').value = '';
  goToStep(1);
}

// ── File loading ───────────────────────────────────────────────────

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      origImg = img;
      $('pi').src = e.target.result;
      layout = detectLayout(img);
      buildEditUI();
      goToStep(2);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Edit form ──────────────────────────────────────────────────────

function buildEditUI() {
  $('di').innerHTML = `<div class="badge"><span class="d"></span>Detected: ${layout.name}</div>`;

  let html = `
    <div class="st">New Seat Info</div>
    <div class="fr">
      <div class="fg">
        <div class="fl">Section</div>
        <input class="fin" id="is" placeholder="117" autocomplete="off">
      </div>
      <div class="fg">
        <div class="fl">Row</div>
        <input class="fin" id="ir" placeholder="H" autocomplete="off">
      </div>
      <div class="fg">
        <div class="fl">Seat</div>
        <input class="fin" id="it" placeholder="15" autocomplete="off">
      </div>
    </div>`;

  if (layout.hasLevel) {
    html += `<div class="nt"><b>Auto:</b> "Enter Gate – Level X" updates from section number (e.g. Section 117 → Level 1). Gate/district area will be cleared.</div>`;
  }

  $('ef').innerHTML = html;
  ['is', 'ir', 'it'].forEach((id) => {
    $(id).addEventListener('input', checkForm);
  });
  checkForm();
}

// ── Generate & download ────────────────────────────────────────────

function handleGenerate() {
  const seat = {
    section: $('is').value.trim(),
    row: $('ir').value.trim(),
    seat: $('it').value.trim(),
  };

  generateEditedTicket($('rc'), origImg, layout, seat);
  goToStep(3);
}

function handleDownload() {
  $('rc').toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket_edited.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

// ── Bootstrap ──────────────────────────────────────────────────────

export function init() {
  // File input
  $('uz').addEventListener('click', () => $('fi').click());
  $('bc').addEventListener('click', () => $('fi').click());
  $('fi').addEventListener('change', (e) => {
    if (e.target.files.length) loadFile(e.target.files[0]);
  });

  // Actions
  $('bg').addEventListener('click', handleGenerate);
  $('bd').addEventListener('click', handleDownload);
  $('bb').addEventListener('click', () => goToStep(2));
  $('br').addEventListener('click', reset);
  $('br2').addEventListener('click', reset);
}
