/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isEqual } from 'lodash';
import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

const PANEL_WIDTH = 320;
const PANEL_GAP = 6;
const VIEWPORT_MARGIN = 16;

interface Placement {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
}

interface Params {
  anchorRef: RefObject<HTMLDivElement>;
  isOpen: boolean;
  value?: string;
}

const resolvePlacement = (anchor: DOMRect) => {
  const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);

  const left = Math.min(
    Math.max(anchor.left, VIEWPORT_MARGIN),
    window.innerWidth - width - VIEWPORT_MARGIN
  );

  const spaceBelow =
    window.innerHeight - anchor.bottom - PANEL_GAP - VIEWPORT_MARGIN;
  const spaceAbove = anchor.top - PANEL_GAP - VIEWPORT_MARGIN;

  if (spaceBelow >= spaceAbove) {
    return {
      left,
      width,
      top: anchor.bottom + PANEL_GAP,
      maxHeight: spaceBelow,
    };
  }

  return {
    left,
    width,
    bottom: window.innerHeight - anchor.top + PANEL_GAP,
    maxHeight: spaceAbove,
  };
};

export function useLineItemTagsPlacement({ anchorRef, isOpen, value }: Params) {
  const [placement, setPlacement] = useState<Placement>();

  const reposition = useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();

    if (!anchor) {
      return;
    }

    const next = resolvePlacement(anchor);

    setPlacement((current) => (isEqual(current, next) ? current : next));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (isOpen) {
      reposition();
    }
  }, [isOpen, value, reposition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen, reposition]);

  return placement;
}
