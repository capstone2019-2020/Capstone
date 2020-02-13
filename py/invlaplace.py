from mpmath import *
from sympy.parsing.sympy_parser import parse_expr
from sympy import N
import matplotlib.pyplot as plt
from multiprocessing import (Process, Array)
from time import time
from math import ceil


def threaded_invertlaplace(f, start, INC, end, x, y):
	_i = start
	_f = lambda t: N(parse_expr(f, local_dict={'t':t}, evaluate=True))

	i = 0
	while _i < end:
		x[i] = _i
		y[i] = invertlaplace(_f, _i, method='stehfest')
		_i+=INC
		i+=1

	return


def t_join_arr(q, sz, d):
	for i in range(0, sz):
		d.append(q[i])


def _invertlaplace_(f, inc, start, end, num_threads):
	PARTITION = (end-start)/num_threads;
	processes = []
	_f = lambda t: N(parse_expr(f, local_dict={'t':t}, evaluate=True))

	l_xq = []
	l_yq = []
	l_p = []
	_sz = ceil(PARTITION/inc)
	for i in range(0, num_threads):
		_start = start+i*PARTITION
		_x = Array('f', _sz, lock=False)
		_y = Array('f', _sz, lock=False)
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
		t_join_arr(_x, _sz, x)
		t_join_arr(_y, _sz, y)

	print('DONE: num_threads='+str(num_threads))


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

	print(x)
	print(y)


if __name__ == "__main__":
	test_perf('1/(1+0.000001*t)')
