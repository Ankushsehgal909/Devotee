import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { LinearGradient } from '../src/components/common/LinearGradient';

describe('LinearGradient', () => {
  it('renders children and gradient correctly', async () => {
    let root: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      root = ReactTestRenderer.create(
        <LinearGradient colors={['#9E1B32', '#6B0E1E']}>
          <Text>Gradient Button Text</Text>
        </LinearGradient>
      );
    });

    expect(root).toBeDefined();
    const textInstance = root?.root.findByType(Text);
    expect(textInstance?.props.children).toBe('Gradient Button Text');
  });
});
