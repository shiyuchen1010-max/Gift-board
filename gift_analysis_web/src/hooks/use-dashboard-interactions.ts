import { useCallback, useEffect, useState } from 'react';

import type { DashboardView, SectionId } from '../types/gift';

interface UseDashboardInteractionsOptions {
  visibleSectionIds: SectionId[];
  activeView: DashboardView;
  sectionViewMap: Record<SectionId, DashboardView>;
  onViewChange: (view: DashboardView) => void;
}

interface UseDashboardInteractionsResult {
  activeSectionId: SectionId;
  selectedGiftId: string | null;
  focusedReviewGiftId: string | null;
  jumpToSection: (sectionId: SectionId) => void;
  selectGift: (giftId: string | null, nextSectionId?: SectionId) => void;
  openReviewForGift: (giftId: string) => void;
  clearReviewFocus: () => void;
}

export function useDashboardInteractions({
  visibleSectionIds,
  activeView,
  sectionViewMap,
  onViewChange,
}: UseDashboardInteractionsOptions): UseDashboardInteractionsResult {
  const [activeSectionId, setActiveSectionId] = useState<SectionId>(visibleSectionIds[0] ?? 'overview');
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [focusedReviewGiftId, setFocusedReviewGiftId] = useState<string | null>(null);
  const [pendingSectionId, setPendingSectionId] = useState<SectionId | null>(null);

  useEffect(() => {
    if (!visibleSectionIds.length) {
      return;
    }

    if (!visibleSectionIds.includes(activeSectionId)) {
      setActiveSectionId(visibleSectionIds[0]);
    }
  }, [activeSectionId, visibleSectionIds]);

  useEffect(() => {
    if (!visibleSectionIds.length) {
      return;
    }

    const elements = visibleSectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = [...entries]
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSectionId(visibleEntry.target.id as SectionId);
        }
      },
      {
        rootMargin: '-24% 0px -58% 0px',
        threshold: [0.15, 0.35, 0.55],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [visibleSectionIds]);

  useEffect(() => {
    if (!pendingSectionId) {
      return;
    }

    if (sectionViewMap[pendingSectionId] !== activeView) {
      return;
    }

    const element = document.getElementById(pendingSectionId);
    if (!element) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setActiveSectionId(pendingSectionId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingSectionId((current) => (current === pendingSectionId ? null : current));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeView, pendingSectionId, sectionViewMap, visibleSectionIds]);

  const jumpToSection = useCallback(
    (sectionId: SectionId) => {
      setActiveSectionId(sectionId);
      setPendingSectionId(sectionId);

      const nextView = sectionViewMap[sectionId];
      if (nextView !== activeView) {
        onViewChange(nextView);
      }
    },
    [activeView, onViewChange, sectionViewMap],
  );

  const selectGift = useCallback(
    (giftId: string | null, nextSectionId?: SectionId) => {
      setSelectedGiftId(giftId);
      if (nextSectionId) {
        jumpToSection(nextSectionId);
      }
    },
    [jumpToSection],
  );

  const openReviewForGift = useCallback(
    (giftId: string) => {
      setSelectedGiftId(giftId);
      setFocusedReviewGiftId(giftId);
      jumpToSection('manual-review');
    },
    [jumpToSection],
  );

  const clearReviewFocus = useCallback(() => {
    setFocusedReviewGiftId(null);
  }, []);

  return {
    activeSectionId,
    selectedGiftId,
    focusedReviewGiftId,
    jumpToSection,
    selectGift,
    openReviewForGift,
    clearReviewFocus,
  };
}
