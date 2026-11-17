import React from 'react';
import { Text, Image } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { CommonAppBackgroundScreen } from '../src/components/common/CommonAppBackgroundScreen';

describe('CommonAppBackgroundScreen', () => {
  it('renders children correctly and defaults resizeMode to stretch', async () => {
    let root: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(
        <CommonAppBackgroundScreen testID="common-app-bg-screen">
          <Text>Onboarding Content</Text>
        </CommonAppBackgroundScreen>
      );
    });

    expect(root).toBeDefined();
    const textInstance = root?.root.findByType(Text);
    expect(textInstance?.props.children).toBe('Onboarding Content');

    const imageInstance = root?.root.findByType(Image);
    expect(imageInstance?.props.resizeMode).toBe('stretch');
  });

  it('renders with scrollable enabled', async () => {
    let root: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(
        <CommonAppBackgroundScreen scrollable>
          <Text>Scrollable Content</Text>
        </CommonAppBackgroundScreen>
      );
    });

    expect(root).toBeDefined();
    const textInstance = root?.root.findByType(Text);
    expect(textInstance?.props.children).toBe('Scrollable Content');
  });
});
