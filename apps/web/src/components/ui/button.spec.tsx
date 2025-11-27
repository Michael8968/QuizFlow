import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { Button } from './button';

describe('Button', () => {
  it('应该正确渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByRole('button', { name: '点击我' })).toBeInTheDocument();
  });

  it('应该正确处理点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击我</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('禁用状态下不应触发点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>点击我</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该渲染不同的按钮变体', () => {
    const { rerender } = render(<Button variant="default">默认</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="destructive">危险</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">轮廓</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');

    rerender(<Button variant="secondary">次要</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="ghost">幽灵</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

    rerender(<Button variant="link">链接</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-primary');
  });

  it('应该渲染不同的按钮尺寸', () => {
    const { rerender } = render(<Button size="default">默认</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="sm">小</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">大</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');

    rerender(<Button size="icon">图标</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-10');
  });

  it('应该支持自定义 className', () => {
    render(<Button className="custom-class">自定义</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('应该支持 asChild 属性', () => {
    render(
      <Button asChild>
        <a href="/test">链接按钮</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: '链接按钮' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});
