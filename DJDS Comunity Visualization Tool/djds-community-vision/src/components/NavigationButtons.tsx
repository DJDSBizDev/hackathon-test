"use client";

import { useTranslation } from "react-i18next";
import { Button } from "./ui/Button";

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  /** Hide the Back button (e.g. nothing meaningful to go back to). */
  hideBack?: boolean;
  nextLabel?: string;
}

/**
 * Standard Back / Next footer. Forward movement is never blocked except where
 * a caller passes `nextDisabled` (only the Scale step does, §7.8).
 */
export function NavigationButtons({
  onBack,
  onNext,
  nextDisabled = false,
  hideBack = false,
  nextLabel,
}: NavigationButtonsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {hideBack ? (
        <span />
      ) : (
        <Button variant="ghost" onClick={onBack}>
          {t("nav2.back")}
        </Button>
      )}
      <Button onClick={onNext} disabled={nextDisabled}>
        {nextLabel ?? t("nav2.next")}
      </Button>
    </div>
  );
}
