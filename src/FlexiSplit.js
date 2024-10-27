import React, { useEffect, useRef } from 'react';
import Split from 'split.js';
import './FlexiSplit.css';

const FlexiSplit = ({ element1Id, element2Id, options = {}, children }) => {
  const panel1Ref = useRef(null);
  const panel2Ref = useRef(null);
  const gutterRef = useRef(null);
  const buttonRef = useRef(null);
  const splitInstanceRef = useRef(null);

  useEffect(() => {
    const element1 = panel1Ref.current;
    const element2 = panel2Ref.current;

    // Apply CSS class based on direction
    const container = element1.parentElement;
    const containerClass = options.direction === 'vertical' ? 'vertical-container' : 'horizontal-container';
    container.classList.add(containerClass);
    element1.classList.add('splitter-panel');
    element2.classList.add('splitter-panel');

    splitInstanceRef.current = Split([element1, element2], {
      sizes: [options.percentage1 || 50, options.percentage2 || 50],
      minSize: [options.minSize1 || 100, options.minSize2 || 100],
      direction: options.direction || 'vertical',
      gutterSize: options.gutterSize || 10,
      snapOffset: 5,
      gutter: (index, direction) => {
        const gutter = document.createElement('div');
        gutter.className = `gutter gutter-${direction}`;
        gutterRef.current = gutter;
        return gutter;
      },
      onDrag: () => {
        if (options.initiallyCollapsed) return false;
      },
    });

    if (options.collapseButtonVisible) {
      createGutterButton();
    }

    if (options.initiallyCollapsed) {
      collapsePanel();
    }

    return () => {
      splitInstanceRef.current?.destroy();
    };
  }, [options]);

  const createGutterButton = () => {
    const button = document.createElement('button');
    button.className = 'gutter-button';
    const arrowDirection = options.direction === 'vertical' ? 'fs-arrow-down' : 'fs-arrow-left';
    button.innerHTML = `<i title="Collapse" class="fs-arrow ${arrowDirection}"></i>`;
    button.addEventListener('click', toggleCollapse);
    gutterRef.current.appendChild(button);
    buttonRef.current = button;
  };

  const collapsePanel = () => {
    const { direction } = options;
    if (direction === 'vertical') {
      splitInstanceRef.current.setSizes([100, 0]);
      panel2Ref.current.style.display = 'none';
    } else {
      splitInstanceRef.current.setSizes([0, 100]);
      panel1Ref.current.style.display = 'none';
    }

    // Add 'gutter-disabled' to gutter only, not the button
    gutterRef.current.classList.add('gutter-disabled');
    buttonRef.current.classList.remove('gutter-disabled'); // Keep the button enabled
    updateButtonIcon(direction, 'expand');
    options.initiallyCollapsed = true;
  };

  const expandPanel = () => {
    const { direction, percentage1 = 50, percentage2 = 50 } = options;
    panel1Ref.current.style.display = 'block';
    panel2Ref.current.style.display = 'block';

    splitInstanceRef.current.setSizes([percentage1, percentage2]);

    // Remove 'gutter-disabled' from gutter only, not the button
    gutterRef.current.classList.remove('gutter-disabled');
    updateButtonIcon(direction, 'collapse');
    options.initiallyCollapsed = false;
  };

  const toggleCollapse = () => {
    options.initiallyCollapsed ? expandPanel() : collapsePanel();
  };

  const updateButtonIcon = (direction, action) => {
    const arrowDir = direction === 'vertical' ? (action === 'expand' ? 'fs-arrow-up' : 'fs-arrow-down') : (action === 'expand' ? 'fs-arrow-right' : 'fs-arrow-left');
    buttonRef.current.className = `gutter-button ${arrowDir}`;
    buttonRef.current.innerHTML = `<i title="${action === 'expand' ? 'Expand' : 'Collapse'}" class="fs-arrow ${arrowDir}"></i>`;
  };

  // Split children into two arrays for each panel
  const panel1Children = Array.isArray(children) ? children[0] : children;
  const panel2Children = Array.isArray(children) ? children[1] : null;

  return (
    <div className="split-container">
      <div id={element1Id} ref={panel1Ref} className="split-panel">
        {panel1Children}
      </div>
      <div id={element2Id} ref={panel2Ref} className="split-panel">
        {panel2Children}
      </div>
    </div>
  );
};

export default FlexiSplit;