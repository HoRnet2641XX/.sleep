/** 薬レビュー用の免責表示 */
export function MedicalDisclaimer() {
  return (
    <div
      className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4"
      role="note"
      aria-label="医療に関する注意事項"
    >
      <p className="text-xs text-amber-300">
        ※ このレビューは個人の感想です。薬の使用については必ず医師にご相談ください。
      </p>
    </div>
  );
}
