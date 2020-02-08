from mpmath import *
from sympy.parsing.sympy_parser import parse_expr
from sympy import N
import matplotlib.pyplot as plt
from multiprocessing import (Process, Queue)
from time import time


def threaded_invertlaplace(f, start, INC, end, x, y):
	_i = start;
	_f = lambda t: N(parse_expr(f, local_dict={'t':t}, evaluate=True))
	while _i < end:
		print(_i)
		x.put(_i)
		y.put(invertlaplace(_f, _i, method='talbot'))
		_i+=INC


def dequeue(q, d):
	while not q.empty():
		d.append(q.get(False))


def _invertlaplace_(f, inc, start, end, num_threads):
	PARTITION = (end-start)/num_threads;
	processes = []
	_f = lambda t: N(parse_expr(f, local_dict={'t':t}, evaluate=True))

	l_xq = []
	l_yq = []
	l_p = []
	for i in range(0, num_threads):
		_start = start+i*PARTITION
		_x = Queue()
		_y = Queue()
		l_xq.append(_x)
		l_yq.append(_y)

		l_p.append(Process(
			target=threaded_invertlaplace,
			args=(f, _start, inc, _start+PARTITION, _x, _y,)
		))

	[p.start() for p in l_p]
	[p.join() for p in l_p]

	x = []
	y = []
	for _x, _y in zip(l_xq, l_yq):
		dequeue(_x, x)
		dequeue(_y, y)


def test_perf(f):
	INC = 0.01
	START = INC
	END = START+1
	MAX_NUM_THREADS = 10

	x = []
	y = []
	for n in range(1, 10):
		x.append(n)
		s = time()
		_invertlaplace_(f, INC, START, END, n)
		e = time()
		y.append(e-s)

	plt.plot(x, y)
	plt.show()


if __name__ == "__main__":
	test_perf('1/(1+0.000001*t)')