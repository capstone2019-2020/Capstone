from mpmath import *
from sympy.parsing.sympy_parser import parse_expr
from sympy import N
import matplotlib.pyplot as plt
from multiprocessing import (Process, Queue)


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


def _invertlaplace_(f):
	processes = []
	_f = lambda t: N(parse_expr(f, local_dict={'t':t}, evaluate=True))

	INC = 0.005
	PARTITION = INC*100
	start1 = 0.01
	x1 = Queue()
	y1 = Queue()
	processes.append(Process(
		target=threaded_invertlaplace,
		args=(f, start1, INC, start1+PARTITION, x1, y1,)
	))

	x2 = Queue()
	y2 = Queue()
	start2 = start1+PARTITION
	processes.append(Process(
		target=threaded_invertlaplace,
		args=(f, start2, INC, start2+PARTITION, x2, y2,)
	))

	x3 = Queue()
	y3 = Queue()
	start3 = start2+PARTITION
	processes.append(Process(
		target=threaded_invertlaplace,
		args=(f, start3, INC, start3+PARTITION, x3, y3)
	))

	x4 = Queue()
	y4 = Queue()
	start4 = start3+PARTITION
	processes.append(Process(
		target=threaded_invertlaplace,
		args=(f, start4, INC, start4+PARTITION, x4, y4)
	))

	x5 = Queue()
	y5 = Queue()
	start5 = start4+PARTITION
	processes.append(Process(
		target=threaded_invertlaplace,
		args=(f, start5, INC, start5+PARTITION, x5, y5)
	))

	[p.start() for p in processes]
	[p.join() for p in processes]

	x = []
	y = []
	
	dequeue(x1, x)
	dequeue(x2, x)
	dequeue(x3, x)
	dequeue(x4, x)
	dequeue(x5, x)

	dequeue(y1, y)
	dequeue(y2, y)
	dequeue(y3, y)
	dequeue(y4, y)
	dequeue(y5, y)

	plt.plot(x, y)
	plt.show()


if __name__ == "__main__":
	_invertlaplace_('1/(1+0.000001*t)')