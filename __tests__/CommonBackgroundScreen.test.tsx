import React from 'react';
import { Text, Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { CommonBackgroundScreen } from '../src/components/common/CommonBackgroundScreen';

describe('CommonBackgroundScreen', () => {
  it('renders children correctly and defaults resizeMode to stretch', async () => {
    let root: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(
        <CommonBackgroundScreen testID="bg-screen">
          <Text>Test Devotee Content</Text>
        </CommonBackgroundScreen>
      );
    });

    expect(root).toBeDefined();
    const textInstance = root?.root.findByType(Text);
    expect(textInstance?.props.children).toBe('Test Devotee Content');

    const imageInstance = root?.root.findByType(Image);
    expect(imageInstance?.props.resizeMode).toBe('stretch');
  });

  it('renders with scrollable enabled', async () => {
    let root: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(
        <CommonBackgroundScreen scrollable>
          <Text>Scrollable Content</Text>
        </CommonBackgroundScreen>
      );
    });

    expect(root).toBeDefined();
    const textInstance = root?.root.findByType(Text);
    expect(textInstance?.props.children).toBe('Scrollable Content');
  });
});
