import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';

import type { Direction, EnhancedProps } from './types';
import { CrosswordContext } from './context';
import { otherDirection } from './util';

interface ClueWrapperProps {
  complete?: boolean | null;
  correct?: boolean | null;
  highlight?: boolean | null;
  highlightBackground?: string | null;
}

const ClueWrapper = styled.div.attrs<ClueWrapperProps>((props) => ({
  className: `clue${
    props.complete ? (props.correct ? ' correct' : ' incorrect') : ''
  }`,
}))<ClueWrapperProps>`
  cursor: default;
  background-color: ${(props) =>
    props.highlight ? props.highlightBackground : 'transparent'};
`;

/**
 * Renders an individual clue, with its number. Makes use of `CrosswordContext`
 * to know whether to render as “highlighted” or not, and uses the theme to
 * provide the highlighting color.
 */
export default function Clue({
  direction,
  number,
  children,
  complete,
  correct,
  ...props
}: EnhancedProps<
  typeof Clue.propTypes,
  {
    /** direction of the clue: “across” or “down”; passed back in onClick */
    direction: Direction;
  }
>) {
  const { highlightBackground, otherHighlightBackground } =
    useContext(ThemeContext);
  const {
    focused,
    selectedDirection,
    selectedNumber,
    handleClueSelected,
    gridData,
    selectedPosition: { row, col },
  } = useContext(CrosswordContext);

  const handleClick = useCallback<React.MouseEventHandler>(
    (event) => {
      event.preventDefault();
      handleClueSelected(direction, number);
    },
    [direction, number, handleClueSelected]
  );

  let otherNumber;
  const cell = gridData[row][col];
  if (cell.used) otherNumber = cell[otherDirection(selectedDirection)];

  const mainHighlight =
    direction === selectedDirection && number === selectedNumber;
  const otherHighlight =
    direction === otherDirection(selectedDirection) && number === otherNumber;

  return (
    <ClueWrapper
      highlightBackground={
        mainHighlight ? highlightBackground : otherHighlightBackground
      }
      highlight={focused && (mainHighlight || otherHighlight)}
      complete={complete}
      correct={correct}
      {...props}
      onClick={handleClick}
      aria-label={`clue-${number}-${direction}`}
    >
      <b>{number}</b>: {children}
    </ClueWrapper>
  );
}

Clue.propTypes = {
  /** direction of the clue: "across" or "down"; passed back in onClick */
  direction: PropTypes.string.isRequired,
  /** number of the clue (the label shown); passed back in onClick */
  number: PropTypes.string.isRequired,
  /** clue text */
  children: PropTypes.node.isRequired,
  /** whether the answer/guess is complete */
  complete: PropTypes.bool,
  /** whether the answer/guess is correct */
  correct: PropTypes.bool,
};

Clue.defaultProps = {
  // children: undefined,
  complete: undefined,
  correct: undefined,
};
